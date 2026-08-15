import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(request: Request) {
  // Get current date in WAT (West Africa Time)
  const now = new Date();
  const watTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const todayStr = watTime.toISOString().split('T')[0];

  await storage.syncFromServer();
  
  const allChallenges = storage.getDailyChallenges();
  
  // Find today's LIVE challenges
  const todayChallenges = allChallenges.filter(c => c.challengeDate === todayStr && c.status === "LIVE");

  return NextResponse.json({ 
    success: true, 
    date: todayStr, 
    challenges: todayChallenges 
  });
}
