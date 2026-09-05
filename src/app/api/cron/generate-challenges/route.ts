import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const maxDuration = 60;

export async function handleRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');

  if (process.env.CRON_SECRET) {
    const isHeaderValid = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isQueryValid = querySecret === process.env.CRON_SECRET;
    if (!isHeaderValid && !isQueryValid && process.env.NODE_ENV === 'production') {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  await storage.syncFromServer();
  
  const { maintainChallengeQueue } = await import("@/lib/games/generator");
  await maintainChallengeQueue();
  
  const { readDb } = await import("@/lib/serverDb");
  const db = (await readDb()) || {};
  const challenges = db.daily_challenges || [];
  
  return NextResponse.json({ 
    success: true, 
    message: "Generation queue maintained successfully.", 
    totalChallenges: challenges.length,
    recentDates: [...new Set(challenges.map((c: any) => c.challengeDate))].slice(0, 7)
  });
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}
