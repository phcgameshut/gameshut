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
    const prompt = `You are a trivia generator for a Nigerian/African daily puzzle game.
Generate 5 unique, thought-provoking trivia questions for the date: ${dateStr}.
CRITICAL INSTRUCTION: The questions should be moderately challenging (a 6/10 difficulty). Mix some hard questions with medium ones. Do NOT ask "cheap" or overly obvious facts (e.g. do not ask "What is the capital of Nigeria?"), but avoid making them so obscure that they are frustrating to play. Ensure the answers are still culturally recognizable or logically deducible.
At least 3 questions should have an African or Nigerian context. The rest can be global knowledge.
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
    const prompt = `Generate a 4x4 Word Hunt grid (16 letters total) for ${dateStr} with a Nigerian or African theme.
The 'grid' MUST be a flat 1D array of exactly 16 uppercase single letters (e.g. ["A", "B", "C", ...]). Do NOT output an array of arrays!
The 'wordsToFind' should be 4-6 words that can be formed by connecting adjacent letters (horizontally, vertically, diagonally).
The 'theme' is a short string describing the theme.

CRITICAL INSTRUCTION: Do NOT reuse these recent themes or words related to them: ${existingThemes.join(', ')}. Avoid overly common cities like Abuja or Lagos. Be creative!

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
    const prompt = `Generate a matching puzzle (5 pairs) for ${dateStr} with a Nigerian or African theme.
CRITICAL INSTRUCTION: The connections should be moderately challenging (a 6/10 difficulty). Mix some hard connections with medium ones. Avoid overly simple or basic associations, but do not make them so obscure that they are frustrating to play. Ensure the answers are still culturally recognizable.
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
CRITICAL INSTRUCTION: Provide exactly 5 clues, progressing from hard (clue 1) to obvious (clue 5). The overall difficulty should be moderate (6/10). The early clues should be challenging but not impossibly obscure. Ensure the entity is culturally recognizable.
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
CRITICAL INSTRUCTION: The difficulty should be moderate (6/10). The mystery should require clever logical deduction to solve, not just guessing, but it shouldn't be overly convoluted.
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
}

// Queue logic
export async function maintainChallengeQueue() {
  console.log("Maintaining challenge queue...");
  
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 45000; // 45 seconds (leaves 15s buffer for Vercel's 60s limit)
  
  const ai = new GeminiProvider();
  
  // Generating all 5 games
  const typesToGenerate: GameTypeSlug[] = ["trivia", "word-hunt", "match-up", "who-am-i", "mystery"];
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
    let latestDate = getNextDayStr(watToday, -1);
    if (typeChallenges.length > 0) {
      const sorted = [...typeChallenges].sort((a, b) => b.challengeDate.localeCompare(a.challengeDate));
      if (sorted[0].challengeDate > latestDate) {
        latestDate = sorted[0].challengeDate;
      }
    }

    const futureChallenges = typeChallenges.filter(c => c.challengeDate > watToday && c.status === "SCHEDULED");
    // Generate at most 2 per type per run to stay well under the Vercel 60s timeout and Gemini RPM limits
    const needToGenerate = Math.min(TARGET_QUEUE_LENGTH - futureChallenges.length, 2);

    if (needToGenerate > 0) {
      console.log(`Need to generate ${needToGenerate} more for ${type}`);
      
      let nextDate = getNextDayStr(latestDate);
      
      for (let i = 0; i < needToGenerate; i++) {
        if (Date.now() - startTime > MAX_EXECUTION_TIME) {
          console.log("Approaching Vercel timeout limit mid-loop. Halting.");
          break;
        }

        try {
          let payload: any = {};
          
          if (type === "trivia") {
            const recentQuestions = typeChallenges.slice(0, 10).flatMap(c => c.content?.questions?.map((q: any) => q.q) || []);
            payload = await ai.generateTrivia(nextDate, recentQuestions);
          } else if (type === "word-hunt") {
            const recentThemes = typeChallenges.slice(0, 10).map(c => c.content?.theme || "");
            payload = await ai.generateWordHunt(nextDate, recentThemes);
          } else if (type === "match-up") {
            const recentThemes = typeChallenges.slice(0, 10).map(c => c.content?.theme || "");
            payload = await ai.generateMatchUp(nextDate, recentThemes);
          } else if (type === "who-am-i") {
            const recentEntities = typeChallenges.slice(0, 10).map(c => c.content?.entity || "");
            payload = await ai.generateWhoAmI(nextDate, recentEntities);
          } else if (type === "mystery") {
            payload = await ai.generateMystery(nextDate);
          }
          
          const newChal: DailyChallenge = {
            id: "chal_" + Math.random().toString(36).substr(2, 9),
            gameTypeId: type,
            challengeNumber: typeChallenges.length + i + 1,
            challengeDate: nextDate,
            content: payload,
            solution: {}, 
            difficulty: "medium",
            status: "SCHEDULED",
            generationMetadata: { provider: "gemini", model: "gemini-flash-lite-latest", generatorVersion: "1.0" },
            createdAt: new Date().toISOString()
          };
          
          allChallenges.push(newChal);
          // Save immediately so progress is not lost if the function times out
          db.daily_challenges = allChallenges;
          await writeDb(db);

          nextDate = getNextDayStr(nextDate);
          console.log(`Generated and saved ${type} for ${newChal.challengeDate}`);
          
        } catch (e) {
          console.error(`Failed to generate ${type} for ${nextDate}`, e);
          break; 
        }
      }
    }
  }
}
