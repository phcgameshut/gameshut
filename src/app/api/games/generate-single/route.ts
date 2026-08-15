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

    if (gameType === "trivia") {
      const recentQuestions = typeChallenges.slice(0, 10).flatMap((c: any) => c.content?.questions?.map((q: any) => q.q) || []);
      payload = await ai.generateTrivia(dateStr, recentQuestions);
    } else if (gameType === "word-hunt") {
      payload = await ai.generateWordHunt(dateStr);
    } else if (gameType === "match-up") {
      const recentThemes = typeChallenges.slice(0, 10).map((c: any) => c.content?.theme || "");
      payload = await ai.generateMatchUp(dateStr, recentThemes);
    } else if (gameType === "who-am-i") {
      const recentEntities = typeChallenges.slice(0, 10).map((c: any) => c.content?.entity || "");
      payload = await ai.generateWhoAmI(dateStr, recentEntities);
    } else if (gameType === "mystery") {
      payload = await ai.generateMystery(dateStr);
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
