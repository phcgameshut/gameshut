import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { DailyChallenge, GameTypeSlug } from "@/lib/storage";
import { readDb, writeDb } from "@/lib/serverDb";

// Helper for dates
export const getNextDayStr = (baseDateStr: string, addDays: number = 1) => {
  const d = new Date(baseDateStr);
  d.setDate(d.getDate() + addDays);
  return d.toISOString().split('T')[0];
};

export const getWatDateString = (date = new Date()) => {
  const watTime = new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  return watTime.toISOString().split('T')[0];
};

// 1. Zod Schema for Trivia
export const TriviaSchema = z.object({
  questions: z.array(z.object({
    q: z.string(),
    options: z.array(z.string()).min(2),
    answer: z.string(),
    explanation: z.string().optional()
  })).min(1)
});

// 2. Zod Schema for Word Hunt
export const WordHuntSchema = z.object({
  grid: z.array(z.string()), // e.g. ["A","B","C",...]
  wordsToFind: z.array(z.string()),
  theme: z.string().optional()
});

// 3. Zod Schema for Match Up
export const MatchUpSchema = z.object({
  pairs: z.array(z.object({
    left: z.string(),
    right: z.string()
  })).min(2),
  theme: z.string()
});

// 4. Zod Schema for Who Am I
export const WhoAmISchema = z.object({
  entity: z.string(),
  clues: z.array(z.string()).min(1)
});

// 5. Zod Schema for Daily Mystery
export const MysterySchema = z.object({
  scenario: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.string(),
  explanation: z.string()
});

// 6. Zod Schema for LinkUp (Connections)
export const LinkUpSchema = z.object({
  theme: z.string().optional(),
  categories: z.array(z.object({
    category: z.string(),
    items: z.array(z.string()).length(4),
    color: z.enum(["yellow", "green", "blue", "purple"]),
    description: z.string().optional()
  })).length(4)
});

// AI Abstraction
export class GeminiProvider {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        const isRateLimit = err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
        const isUnavailable = err?.message?.includes("503") || err?.status === 503 || err?.message?.includes("high demand");
        if ((isRateLimit || isUnavailable) && attempt < maxRetries) {
          const delay = 1000 + Math.random() * 1500; // 1s - 2.5s
          console.log(`Rate limited. Retrying in ${Math.round(delay/1000)}s (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(res => setTimeout(res, delay));
        } else {
          throw err;
        }
      }
    }
    throw new Error("Max retries exceeded");
  }

  async generateTrivia(dateStr: string, existingQuestions: string[]): Promise<z.infer<typeof TriviaSchema>> {
    const prompt = `You are a master trivia creator for GamesHut daily trivia for date: ${dateStr}.
Generate 5 unique, thought-provoking, and intellectually stimulating trivia questions.

CRITICAL INSTRUCTIONS:
1. DIFFICULTY LEVEL: 8/10 to 9.5/10 (Smart, complex, and tricky).
2. STRICTLY NO ELEMENTARY FACTS: Do NOT ask kindergarten or basic 101 questions (e.g. NEVER ask "What is the currency of Nigeria?", "What is the capital of Nigeria/Ghana/France?", "Who is the president of Nigeria?", "What continent is Nigeria in?").
3. RICH, SPECIFIC CONTEXT:
   - At least 3 questions MUST focus on African or Nigerian history, ancient kingdoms/civilizations, landmark literature, pre-colonial architecture, iconic cinema, geography, or indigenous science/inventions.
   - The remaining questions can explore global knowledge, board game history, philosophy, or science.
4. CLEVER DISTRACTORS: All 4 multiple choice options must be realistic, highly believable historical/factual peers so players cannot trivially eliminate options.
5. EXPLANATION: Provide a fascinating 1-sentence explanation of the historical or factual context.

DO NOT reuse any of these recent questions:
${existingQuestions.map(q => "- " + q).join('\n')}

Output JSON adhering strictly to the schema provided.`;


    const response = await this.retryWithBackoff(() => this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["q", "options", "answer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    }));

    const text = response.text;
    if (!text) throw new Error("Failed to generate content");
    
    const parsed = JSON.parse(text);
    return TriviaSchema.parse(parsed);
  }

  async generateWordHunt(dateStr: string, existingThemes: string[] = []): Promise<z.infer<typeof WordHuntSchema>> {
    const prompt = `Generate a 4x4 Word Hunt grid (16 letters total) for ${dateStr} with a Nigerian, African, or tabletop gaming theme.
The 'grid' MUST be a flat 1D array of exactly 16 uppercase single letters (e.g. ["A", "B", "C", ...]). Do NOT output an array of arrays!
The 'wordsToFind' should be 4-6 words that can be formed by connecting adjacent letters (horizontally, vertically, diagonally).
The 'theme' is a short string describing the theme.

CRITICAL INSTRUCTION:
- Difficulty MUST be 8/10.
- Words to find must be REAL, recognizable, legitimate English words or famous Nigerian cultural/gaming words (4 to 7 letters long, e.g. JOLLOF, SUYA, AMALA, FABRIC, SAFARI, MARKET, ANKARA, GUITAR, CASTLE, MONOPOLY).
- NEVER invent unpronounceable fragments or obscure non-words.
- All words in 'wordsToFind' MUST strictly exist and be traceable in the 4x4 grid.

DO NOT reuse these recent themes or words related to them: ${existingThemes.join(', ')}.

Output JSON adhering strictly to the schema provided.`;

    const response = await this.retryWithBackoff(() => this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grid: { type: Type.ARRAY, items: { type: Type.STRING } },
            wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
            theme: { type: Type.STRING }
          },
          required: ["grid", "wordsToFind"]
        }
      }
    }));

    const text = response.text;
    if (!text) throw new Error("Failed to generate content");
    return WordHuntSchema.parse(JSON.parse(text));
  }

  async generateMatchUp(dateStr: string, existingThemes: string[]): Promise<z.infer<typeof MatchUpSchema>> {
    const prompt = `Generate a matching puzzle (5 pairs) for ${dateStr} with a Nigerian, African, or tabletop gaming theme.
CRITICAL INSTRUCTIONS:
1. DIFFICULTY: 8/10 (Complex, intelligent, and culturally or intellectually tricky).
2. ZERO ELEMENTARY ASSOCIATIONS: Absolutely NEVER use simplistic pairings like "Jollof <-> Rice", "Lagos <-> Eko", "Ankara <-> Fabric", or "Harmattan <-> Season".
3. SOPHISTICATED THEMES & PAIRS:
   Create pairs that require genuine cultural, historical, literary, geographic, or gaming knowledge. Excellent examples:
   - Renowned African Authors <-> Landmark Novels/Plays (e.g. Amos Tutuola <-> The Palm-Wine Drinkard, Buchi Emecheta <-> The Joys of Motherhood, Elechi Amadi <-> The Concubine, Wole Soyinka <-> Death and the King's Horseman, Ngũgĩ wa Thiong'o <-> Petals of Blood)
   - Ancient African Monarchs/Leaders <-> Their Kingdom/Empire (e.g. Queen Amina <-> Zazzau, Oba Ewuare I <-> Benin Empire, Mansa Musa <-> Mali Empire, Alaafin Atiba <-> New Oyo, Mai Idris Alooma <-> Kanem-Bornu)
   - Notable Nigerian Waterfalls/Landmarks <-> The State They Reside In (e.g. Gurara Waterfalls <-> Niger, Erin-Ijesha <-> Osun, Farin Ruwa <-> Nasarawa, Idanre Hills <-> Ondo, Ogbunike Caves <-> Anambra)
   - Legendary African Footballers <-> Famous Nicknames (e.g. Segun Odegbami <-> Mathematical, Nwankwo Kanu <-> Papilo, Christian Chukwu <-> Chairman, Daniel Amokachi <-> The Bull, Rashidi Yekini <-> Goalsfather)
   - Traditional Musical Instruments <-> Instrument Family / How It Is Played (e.g. Kakaki <-> Long Brass Trumpet, Udu <-> Clay Water Drum, Goje <-> Two-Stringed Fiddle, Bata <-> Double-Headed Drum)
   - Modern Board Games <-> Core Game Mechanic (e.g. Catan <-> Resource Trading, Scrabble <-> Anagrams, Carcassonne <-> Tile Placement, Pandemic <-> Cooperative Play)
4. Ensure all 5 pairs belong to the same cohesive theme, with completely unambiguous 1-to-1 mappings.
DO NOT use these recent themes: ${existingThemes.join(', ')}

Output JSON adhering strictly to the schema provided.`;


    const response = await this.retryWithBackoff(() => this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pairs: { 
              type: Type.ARRAY, 
              items: { type: Type.OBJECT, properties: { left: { type: Type.STRING }, right: { type: Type.STRING } }, required: ["left", "right"] }
            },
            theme: { type: Type.STRING }
          },
          required: ["pairs", "theme"]
        }
      }
    }));
    const text = response.text;
    if (!text) throw new Error("Failed to generate content");
    return MatchUpSchema.parse(JSON.parse(text));
  }

  async generateWhoAmI(dateStr: string, existingEntities: string[]): Promise<z.infer<typeof WhoAmISchema>> {
    const prompt = `Generate a "Who Am I?" progressive clue deduction game for ${dateStr}.
The entity MUST be a well-known Nigerian person, place, or landmark.
CRITICAL INSTRUCTION: Provide exactly 5 clues. The overall difficulty should be 8.5/10. The hardest hint MUST always come first (clue 1), followed progressively by simpler and more obvious ones, ending with the easiest (clue 5). The early clues should be highly challenging but logically sound.
DO NOT use these recent entities: ${existingEntities.join(', ')}

Output JSON adhering strictly to the schema provided.`;


    const response = await this.retryWithBackoff(() => this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            entity: { type: Type.STRING },
            clues: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["entity", "clues"]
        }
      }
    }));
    const text = response.text;
    if (!text) throw new Error("Failed to generate content");
    return WhoAmISchema.parse(JSON.parse(text));
  }

  async generateMystery(dateStr: string): Promise<z.infer<typeof MysterySchema>> {
    const prompt = `Generate a short Daily Mystery logical deduction scenario for ${dateStr}.
The 'scenario' should be a short paragraph describing an intriguing mysterious situation or puzzle in an African context. 
CRITICAL INSTRUCTION: The difficulty should be extreme (10/10). The mystery should require brilliant lateral thinking and complex logical deduction to solve, avoiding any obvious tropes or simple guessing.
The 'question' asks what happened or who did it.
Provide 4 plausible 'options' that all sound highly believable, specify the correct 'answer' (must match one option exactly), and an 'explanation' detailing the clever logical deduction required to reach the answer.

Output JSON adhering strictly to the schema provided.`;


    const response = await this.retryWithBackoff(() => this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["scenario", "question", "options", "answer", "explanation"]
        }
      }
    }));
    const text = response.text;
    if (!text) throw new Error("Failed to generate content");
    return MysterySchema.parse(JSON.parse(text));
  }

  async generateLinkUp(dateStr: string, existingThemes: string[] = []): Promise<z.infer<typeof LinkUpSchema>> {
    const prompt = `You are a master puzzle designer for GamesHut LinkUp (a NYT Connections-style 4x4 grouping game) for date: ${dateStr}.
Generate exactly 4 distinct categories with 4 items each (16 items total).

CRITICAL INSTRUCTIONS FOR COMPLEX, TRICKY 8/10 DIFFICULTY:
1. SHORT, UNIFORM TILES: Every single item MUST be 1 or 2 words maximum (prefer single words or 2-word terms like "PALM OIL", "MONOPOLY", "SUYA", "CHOP").
   NEVER use long 3+ word full names or descriptions. All 16 tiles must look uniform in length and visual weight so players cannot group by visual length or format.
2. RED HERRINGS & OVERLAPS (THE KEY TO 8/10 DIFFICULTY):
   - At least 2 or 3 items MUST temptingly appear to belong to multiple categories on the board!
   - Examples of great red herrings:
     - Category 1: NIGERIAN STREET FOODS [SUYA, AKARA, BOLE, KILISHI]
     - Category 2: THINGS YOU CAN ROAST OR GRILL [CORN, PLANTAIN, CHICKEN, PEANUT]
     (Here "BOLE" or "SUYA" could tempt the grill category, or "PLANTAIN" could tempt the food category!)
     - Category 1: ANCIENT WEST AFRICAN EMPIRES [BENIN, OYO, MALI, SONGHAI]
     - Category 2: NIGERIAN STATES NAMED AFTER RIVERS [NIGER, BENUE, KADUNA, CROSS RIVER]
     (Here BENIN, OYO, NIGER, KADUNA tempt someone into thinking "Nigerian regions/cities", creating a tempting dead end!)
   - Words with multiple meanings (polysemes: BAR, CHOP, PALM, BANK, STRIKE, CROWN, KEY, IRON) make excellent tiles.
3. 100% OBJECTIVE & FACTUAL:
   - ZERO subjective, vague, or nonsensical riddles (e.g. NEVER "Things with keys: Island"). Every connection must be factually undeniable once revealed.
   - Use standard authentic spelling (e.g. "SHAKU SHAKU", "SUYA", "KILISHI").
4. 4 COLOR-CODED TIERS:
   - "yellow": Straightforward category, but with 1 distractor tile from another group.
   - "green": Cultural / Historical / Pop-culture / Geographic facts.
   - "blue": Clever compound words or contextual associations (e.g. Words that can follow "HOT", Things associated with a coronation).
   - "purple": Tricky lateral deduction, wordplay, or deceptive pattern (e.g. "Words with animal names hidden inside", "Words that form a Nigerian city when prepended with 'I'", "Board games hidden in everyday words").
5. STRICTLY ONE UNIQUE VALID 4x4 SOLUTION:
   - The red herrings must tempt players into dead ends of 5 candidates, but there must be exactly ONE combination of 4 mutually exclusive groups of 4 that solves all 16 words.
6. DO NOT reuse recent themes: ${existingThemes.join(', ')}

Output JSON adhering strictly to the schema provided.`;

    const response = await this.retryWithBackoff(() => this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  items: { type: Type.ARRAY, items: { type: Type.STRING } },
                  color: { type: Type.STRING, enum: ["yellow", "green", "blue", "purple"] },
                  description: { type: Type.STRING }
                },
                required: ["category", "items", "color"]
              }
            }
          },
          required: ["categories"]
        }
      }
    }));

    const text = response.text;
    if (!text) throw new Error("Failed to generate LinkUp content");
    return LinkUpSchema.parse(JSON.parse(text));
  }
}

// Queue logic
export async function maintainChallengeQueue() {
  console.log("Maintaining challenge queue...");
  
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 45000; // 45 seconds (leaves 15s buffer for Vercel's 60s limit)
  
  const ai = new GeminiProvider();
  
  // Generating active 4 games
  const typesToGenerate: GameTypeSlug[] = ["trivia", "word-hunt", "match-up", "link-up"];
  const TARGET_QUEUE_LENGTH = 7;
  
  const db = await readDb() || {};
  let allChallenges: DailyChallenge[] = db.daily_challenges || db.gh_daily_challenges || [];

  // Run generation for all types sequentially
  for (const type of typesToGenerate) {
    if (Date.now() - startTime > MAX_EXECUTION_TIME) {
      console.log("Approaching Vercel timeout limit. Halting generation until next cron run.");
      break;
    }

    const typeChallenges = allChallenges.filter(c => c.gameTypeId === type);
    const watToday = getWatDateString();

    // Check dates from watToday to watToday + TARGET_QUEUE_LENGTH for missing challenges
    const datesNeeded: string[] = [];
    let curDate = watToday;
    for (let d = 0; d < TARGET_QUEUE_LENGTH; d++) {
      const exists = typeChallenges.some(c => c.challengeDate === curDate);
      if (!exists) {
        datesNeeded.push(curDate);
      }
      curDate = getNextDayStr(curDate);
    }

    // Generate up to 2 missing dates per type per run to stay within timeout
    const datesToGenerate = datesNeeded.slice(0, 2);

    if (datesToGenerate.length > 0) {
      console.log(`Need to generate ${datesToGenerate.length} more for ${type}: ${datesToGenerate.join(', ')}`);
      
      for (const targetDate of datesToGenerate) {
        if (Date.now() - startTime > MAX_EXECUTION_TIME) {
          console.log("Approaching Vercel timeout limit mid-loop. Halting.");
          break;
        }

        try {
          let payload: any = {};
          
          if (type === "trivia") {
            const recentQuestions = typeChallenges.slice(0, 10).flatMap(c => c.content?.questions?.map((q: any) => q.q) || []);
            payload = await ai.generateTrivia(targetDate, recentQuestions);
          } else if (type === "word-hunt") {
            const recentThemes = typeChallenges.slice(0, 10).map(c => c.content?.theme || "");
            payload = await ai.generateWordHunt(targetDate, recentThemes);
          } else if (type === "match-up") {
            const recentThemes = typeChallenges.slice(0, 10).map(c => c.content?.theme || "");
            payload = await ai.generateMatchUp(targetDate, recentThemes);
          } else if (type === "link-up") {
            const recentThemes = typeChallenges.slice(0, 10).map(c => c.content?.theme || c.content?.categories?.[0]?.category || "");
            payload = await ai.generateLinkUp(targetDate, recentThemes);
          } else if (type === "who-am-i") {
            const recentEntities = typeChallenges.slice(0, 10).map(c => c.content?.entity || "");
            payload = await ai.generateWhoAmI(targetDate, recentEntities);
          } else if (type === "mystery") {
            payload = await ai.generateMystery(targetDate);
          }
          
          const newChal: DailyChallenge = {
            id: "chal_" + Math.random().toString(36).substr(2, 9),
            gameTypeId: type,
            challengeNumber: typeChallenges.length + 1,
            challengeDate: targetDate,
            content: payload,
            solution: {}, 
            difficulty: type === "link-up" || type === "word-hunt" ? "hard" : "medium",
            status: targetDate <= watToday ? "LIVE" : "SCHEDULED",
            generationMetadata: { provider: "gemini", model: "gemini-flash-lite-latest", generatorVersion: "1.0" },
            createdAt: new Date().toISOString()
          };
          
          allChallenges.push(newChal);
          typeChallenges.push(newChal);
          // Save immediately so progress is not lost if the function times out
          db.daily_challenges = allChallenges;
          await writeDb(db);

          console.log(`Generated and saved ${type} for ${newChal.challengeDate}`);
        } catch (e) {
          console.error(`Failed to generate ${type} for ${targetDate}`, e);
          break; 
        }
      }
    }
  }
}
