import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";
import { DailyChallenge, GameTypeSlug } from "@/lib/storage";
import { GeminiProvider } from "@/lib/games/generator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALL_GAME_TYPES: GameTypeSlug[] = ["trivia", "word-hunt", "match-up", "who-am-i", "mystery"];

export async function GET(request: Request) {
  // Get current date in WAT (West Africa Time)
  const now = new Date();
  const watTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const todayStr = watTime.toISOString().split('T')[0];

  const db = (await readDb()) || {};
  let allChallenges: DailyChallenge[] = db.daily_challenges || db.gh_daily_challenges || [];
  
  // Find today's challenges (ignore status to instantly publish them)
  let todayChallenges = allChallenges.filter(c => c.challengeDate === todayStr);

  // Check if any of the 5 standard games are missing for today
  const existingTypes = new Set(todayChallenges.map(c => c.gameTypeId));
  const missingTypes = ALL_GAME_TYPES.filter(t => !existingTypes.has(t));

  if (missingTypes.length > 0) {
    console.log(`[JIT] Missing ${missingTypes.length} challenges for ${todayStr} (${missingTypes.join(', ')}). Generating on the fly...`);
    const ai = new GeminiProvider();

    // Generate missing game types concurrently
    const generationPromises = missingTypes.map(async (type) => {
      try {
        const typeChallenges = allChallenges.filter(c => c.gameTypeId === type);
        let payload: any = {};

        if (type === "trivia") {
          const recentQuestions = typeChallenges.slice(0, 10).flatMap(c => c.content?.questions?.map((q: any) => q.q) || []);
          payload = await ai.generateTrivia(todayStr, recentQuestions);
        } else if (type === "word-hunt") {
          const recentThemes = typeChallenges.slice(0, 10).map(c => c.content?.theme || "");
          payload = await ai.generateWordHunt(todayStr, recentThemes);
        } else if (type === "match-up") {
          const recentThemes = typeChallenges.slice(0, 10).map(c => c.content?.theme || "");
          payload = await ai.generateMatchUp(todayStr, recentThemes);
        } else if (type === "who-am-i") {
          const recentEntities = typeChallenges.slice(0, 10).map(c => c.content?.entity || "");
          payload = await ai.generateWhoAmI(todayStr, recentEntities);
        } else if (type === "mystery") {
          payload = await ai.generateMystery(todayStr);
        }

        const newChal: DailyChallenge = {
          id: "chal_" + Math.random().toString(36).substr(2, 9),
          gameTypeId: type,
          challengeNumber: typeChallenges.length + 1,
          challengeDate: todayStr,
          content: payload,
          solution: {},
          difficulty: type === "mystery" || type === "word-hunt" ? "hard" : "medium",
          status: "LIVE",
          generationMetadata: { provider: "gemini", model: "gemini-flash-lite-latest", generatorVersion: "1.0" },
          createdAt: new Date().toISOString()
        };
        return newChal;
      } catch (err) {
        console.error(`[JIT] Generation failed for ${type}:`, err);
        return null;
      }
    });

    const results = await Promise.all(generationPromises);
    const newlyGenerated = results.filter((c): c is DailyChallenge => c !== null);

    if (newlyGenerated.length > 0) {
      allChallenges = [...newlyGenerated, ...allChallenges];
      todayChallenges = [...todayChallenges, ...newlyGenerated];
      db.daily_challenges = allChallenges;
      await writeDb(db);
      console.log(`[JIT] Successfully saved ${newlyGenerated.length} challenges for ${todayStr}.`);
    }
  }

  return NextResponse.json({ 
    success: true, 
    date: todayStr, 
    challenges: todayChallenges 
  });
}
