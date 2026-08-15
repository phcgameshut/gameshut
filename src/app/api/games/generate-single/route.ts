import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";
import { GeminiProvider, getWatDateString, getNextDayStr } from "@/lib/games/generator";
import { DailyChallenge, GameTypeSlug } from "@/lib/storage";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { gameType, targetDate } = await request.json();
    
    const validTypes: GameTypeSlug[] = ["trivia", "word-hunt", "match-up", "who-am-i", "mystery"];
    if (!validTypes.includes(gameType)) {
      return NextResponse.json({ success: false, error: "Invalid game type" }, { status: 400 });
    }

    const db: any = await readDb() || {};
    const allChallenges: DailyChallenge[] = db.daily_challenges || db.gh_daily_challenges || [];
    const ai = new GeminiProvider();
    const dateStr = targetDate || getWatDateString();

    // Check if this date+type already exists
    const existing = allChallenges.find(c => c.challengeDate === dateStr && c.gameTypeId === gameType);
    if (existing) {
      return NextResponse.json({ success: false, error: `A ${gameType} challenge for ${dateStr} already exists (status: ${existing.status})` }, { status: 409 });
    }

    const typeChallenges = allChallenges.filter(c => c.gameTypeId === gameType);
    let payload: any = {};

    try {
      if (gameType === "trivia") {
        const recentQuestions = typeChallenges.slice(0, 5).flatMap((c: any) => c.content?.questions?.map((q: any) => q.q) || []);
        payload = await ai.generateTrivia(dateStr, recentQuestions);
      } else if (gameType === "word-hunt") {
        payload = await ai.generateWordHunt(dateStr);
      } else if (gameType === "match-up") {
        const recentThemes = typeChallenges.slice(0, 5).map((c: any) => c.content?.theme || "");
        payload = await ai.generateMatchUp(dateStr, recentThemes);
      } else if (gameType === "who-am-i") {
        const recentEntities = typeChallenges.slice(0, 5).map((c: any) => c.content?.entity || "");
        payload = await ai.generateWhoAmI(dateStr, recentEntities);
      } else if (gameType === "mystery") {
        payload = await ai.generateMystery(dateStr);
      }
    } catch (apiError) {
      console.warn("AI Generation failed, using fallbacks where possible:", apiError);
      if (gameType === "trivia") {
        payload = {
          questions: [
            { q: "What is the capital of Nigeria?", options: ["Lagos", "Abuja", "Kano", "Ibadan"], answer: "Abuja", explanation: "Abuja became the capital in 1991." },
            { q: "Which Nigerian artist is known as the African Giant?", options: ["Wizkid", "Davido", "Burna Boy", "Olamide"], answer: "Burna Boy", explanation: "His 2019 album was titled African Giant." },
            { q: "What is the longest river in Africa?", options: ["Nile", "Niger", "Congo", "Zambezi"], answer: "Nile", explanation: "The Nile is the longest river in the world." },
            { q: "Who was the first President of Nigeria?", options: ["Nnamdi Azikiwe", "Olusegun Obasanjo", "Muhammadu Buhari", "Goodluck Jonathan"], answer: "Nnamdi Azikiwe", explanation: "He served as the first President from 1963 to 1966." },
            { q: "What is the traditional Yoruba food made from yam?", options: ["Amala", "Eba", "Fufu", "Pounded Yam"], answer: "Amala", explanation: "Amala is made from yam flour." }
          ]
        };
      } else if (gameType === "mystery") {
        payload = {
          scenario: "A famous Nigerian chef's secret jollof recipe book was stolen from her kitchen. The only clues are a muddy boot print, a faint smell of vanilla, and a misplaced whisk.",
          question: "Who is the most likely suspect?",
          options: ["The gardener with muddy boots", "The rival chef who bakes desserts", "The kitchen assistant who misplaced the whisk", "The delivery boy who brought vanilla extract"],
          answer: "The rival chef who bakes desserts",
          explanation: "The faint smell of vanilla points to a baker, and the rival chef fits the profile of someone who bakes desserts and wants a jollof recipe."
        };
      } else {
        throw new Error("AI Generation failed and no fallback is available for this game type.");
      }
    }

    const newChallenge: DailyChallenge = {
      id: "chal_" + Math.random().toString(36).substr(2, 9),
      gameTypeId: gameType,
      challengeNumber: typeChallenges.length + 1,
      challengeDate: dateStr,
      content: payload,
      solution: {},
      difficulty: "medium",
      status: "LIVE",
      generationMetadata: { provider: "gemini", model: "gemini-flash-latest", generatorVersion: "1.0" },
      createdAt: new Date().toISOString()
    };

    const updatedChallenges = [...allChallenges, newChallenge];
    db.daily_challenges = updatedChallenges;
    await writeDb(db);

    return NextResponse.json({ success: true, challenge: newChallenge });
  } catch (e: any) {
    console.error("Generation error:", e);
    return NextResponse.json({ success: false, error: e.message || "Generation failed" }, { status: 500 });
  }
}
