import { NextResponse } from "next/server";
import { readDb } from "@/lib/serverDb";
import { DailyChallenge } from "@/lib/storage";

export async function GET(request: Request) {
  // Get current date in WAT (West Africa Time)
  const now = new Date();
  const watTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const todayStr = watTime.toISOString().split('T')[0];

  const db = await readDb() || {};
  const allChallenges: DailyChallenge[] = db.daily_challenges || db.gh_daily_challenges || [];
  
  // Find today's challenges (ignore status to instantly publish them)
  const todayChallenges = allChallenges.filter(c => c.challengeDate === todayStr);

  return NextResponse.json({ 
    success: true, 
    date: todayStr, 
    challenges: todayChallenges 
  });
}
