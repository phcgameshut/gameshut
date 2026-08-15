import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const maxDuration = 60;

export async function GET(request: Request) {
  // In production, Vercel sets an authorization header for cron jobs.
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') {
       return new Response('Unauthorized', { status: 401 });
    }
  }

  await storage.syncFromServer();
  
  const { maintainChallengeQueue } = await import("@/lib/games/generator");
  await maintainChallengeQueue();
  
  const { readDb } = await import("@/lib/serverDb");
  const db = await readDb() || {};
  
  return NextResponse.json({ success: true, message: "Generation queue maintained successfully.", db });
}
