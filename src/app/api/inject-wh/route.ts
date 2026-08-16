import { NextResponse } from "next/server";
import { getFirestoreDb, readDb, writeDb } from "@/lib/serverDb";

export async function GET(request: Request) {
  try {
    const today = "2026-08-16";
    const newChallenge = {
      id: "chal_" + Math.random().toString(36).substr(2, 9),
      gameTypeId: "word-hunt",
      challengeNumber: 2,
      challengeDate: today,
      content: {
        grid: [
          "Y", "A", "M", "S",
          "O", "F", "E", "O",
          "U", "P", "S", "U",
          "A", "B", "A", "P"
        ],
        wordsToFind: ["YAMS", "OFE", "ABA", "SOUP"],
        theme: "Nigerian Delicacies"
      },
      solution: {},
      difficulty: "medium",
      status: "LIVE",
      generationMetadata: {
        provider: "manual",
        model: "manual",
        generatorVersion: "1.0"
      },
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };

    const db = await getFirestoreDb();
    if (db) {
      await db.collection("gh_daily_challenges").doc(newChallenge.id).set(newChallenge);
    } else {
      const data = await readDb();
      if (!data.gh_daily_challenges) data.gh_daily_challenges = [];
      data.gh_daily_challenges.push(newChallenge);
      await writeDb(data);
    }

    return NextResponse.json({ success: true, message: "Injected WH" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
