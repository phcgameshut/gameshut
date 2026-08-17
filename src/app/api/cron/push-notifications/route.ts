import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";
import { storage } from "@/lib/storage";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') {
       return new Response('Unauthorized', { status: 401 });
    }
  }

  const db = await readDb() || {};
  const players = db.players || [];
  
  if (players.length > 0) {
    console.log(`Sending Daily Games Live push notifications to ${players.length} players...`);
    
    // In a real app, this would use WebPush to dispatch push notifications to subscriptions.
    // For this MVP, we inject in-app notifications so they see it on their dashboard/toast.
    if (!db.notifications) db.notifications = [];
    
    const attempts = db.game_attempts || [];
    const todayStr = new Date().toISOString().split('T')[0];
    
    players.forEach((p: any) => {
      // Don't send push if they already played today
      const hasPlayedToday = attempts.some((a: any) => a.userId === p.id && a.challengeDate === todayStr);
      if (hasPlayedToday) return;

      db.notifications.push({
        id: "n_" + Math.random().toString(36).substr(2, 9),
        userId: p.id,
        title: "Daily Games are LIVE! 🎮",
        message: "Your new challenges for today are ready. Play now to protect your streak and earn points!",
        type: "system",
        status: "unread",
        createdAt: new Date().toISOString()
      });
    });
    
    await writeDb(db);
  }

  return NextResponse.json({ success: true, message: "Push notifications dispatched." });
}
