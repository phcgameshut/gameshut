import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";
import { DailyChallenge } from "@/lib/storage";

export const maxDuration = 60;

// Vercel Cron will hit this endpoint daily at 23:00 UTC (00:00 WAT)
export async function GET(request: Request) {
  // In production, Vercel sets an authorization header for cron jobs.
  // For MVP, we can just allow it, or check process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') {
       return new Response('Unauthorized', { status: 401 });
    }
  }

  // Get current date in WAT (West Africa Time)
  const now = new Date();
  const watTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const todayStr = watTime.toISOString().split('T')[0];

  // Force sync from server first (because this API might run on a fresh lambda)
  const db = await readDb() || {};
  
  let allChallenges: DailyChallenge[] = db.daily_challenges || [];
  let modified = false;

  // Find all APPROVED or SCHEDULED challenges for today and set them to LIVE
  allChallenges = allChallenges.map(c => {
    if (c.challengeDate === todayStr && (c.status === "APPROVED" || c.status === "SCHEDULED" || c.status === "GENERATING")) {
      // Force anything scheduled for today to be live
      modified = true;
      return { ...c, status: "LIVE", publishedAt: new Date().toISOString() };
    }
    
    // Optionally archive older live challenges
    if (c.challengeDate < todayStr && c.status === "LIVE") {
      modified = true;
      return { ...c, status: "ARCHIVED" };
    }
    
    return c;
  });

  if (modified) {
    db.daily_challenges = allChallenges;
    await writeDb(db);
  }

  return NextResponse.json({ success: true, publishedDate: todayStr, message: "Published daily challenges." });
}
