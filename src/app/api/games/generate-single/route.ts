import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";
import { GeminiProvider, getWatDateString, getNextDayStr } from "@/lib/games/generator";
import { DailyChallenge, GameTypeSlug } from "@/lib/storage";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { gameType, targetDate, overwrite } = await request.json();
    
    const validTypes: GameTypeSlug[] = ["trivia", "word-hunt", "match-up", "who-am-i", "mystery"];
    if (!validTypes.includes(gameType)) {
      return NextResponse.json({ success: false, error: "Invalid game type" }, { status: 400 });
    }

    const db: any = await readDb() || {};
    let allChallenges: DailyChallenge[] = db.daily_challenges || db.gh_daily_challenges || [];
    const ai = new GeminiProvider();
    const dateStr = targetDate || getWatDateString();

    // Check if this date+type already exists
    const existing = allChallenges.find(c => c.challengeDate === dateStr && c.gameTypeId === gameType);
    if (existing && !overwrite) {
      return NextResponse.json({ success: false, error: `A ${gameType} challenge for ${dateStr} already exists (status: ${existing.status})` }, { status: 409 });
    }
    
    if (existing && overwrite) {
      // Remove the existing one from the array so we can generate and push a new one
      allChallenges = allChallenges.filter(c => c.id !== existing.id);
    }

    const typeChallenges = allChallenges.filter(c => c.gameTypeId === gameType);
    let payload: any = {};

    try {
      if (gameType === "trivia") {
        const recentQuestions = typeChallenges.slice(0, 5).flatMap((c: any) => c.content?.questions?.map((q: any) => q.q) || []);
        payload = await ai.generateTrivia(dateStr, recentQuestions);
      } else if (gameType === "word-hunt") {
        const recentThemes = typeChallenges.slice(0, 5).map((c: any) => c.content?.theme || "");
        payload = await ai.generateWordHunt(dateStr, recentThemes);
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
      console.error("AI Generation failed:", apiError);
      return NextResponse.json({ success: false, error: `AI Generation failed (e.g. High Demand): ${apiError}` }, { status: 503 });
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
      generationMetadata: { provider: "gemini", model: "gemini-flash-lite-latest", generatorVersion: "1.0" },
      createdAt: new Date().toISOString()
    };

    const updatedChallenges = [...allChallenges, newChallenge];
    db.daily_challenges = updatedChallenges;
    await writeDb(db);

    return NextResponse.json({ success: true, challenge: newChallenge });
  } catch (e: any) {
    console.error("AI Generation Error:", e);
    return NextResponse.json({ success: false, error: `AI Generation failed: ${e.message || 'Unknown error'}` }, { status: 500 });
  }
}
