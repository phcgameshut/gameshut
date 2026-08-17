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
  const streaks = db.user_streaks || [];
  
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

      if (p.email && process.env.BREVO_API_KEY) {
        const userStreak = streaks.find((s: any) => s.userId === p.id);
        const currentStreak = userStreak ? userStreak.currentStreak : 0;
        const name = p.name ? p.name.split(" ")[0] : "Player";

        let bodyText = `The daily games are live! Can you conquer today's challenges?`;
        if (currentStreak > 0) {
          bodyText = `The daily games are live! You are on a ${currentStreak}-day streak. Log in now and play today's puzzles to protect your streak!`;
        }

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; text-align: center;">
            <h2 style="color: #6366f1;">GamesHut Arena</h2>
            <h3 style="color: #334155;">Time to play, ${name}!</h3>
            <p style="font-size: 16px; color: #475569; margin-bottom: 30px;">${bodyText}</p>
            <a href="https://gameshut.ng/games" style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">Play Today's Games</a>
            <p style="margin-top: 40px; font-size: 12px; color: #94a3b8;">You are receiving this because you are registered on GamesHut. Please do not reply to this email (daily@gameshut.ng).</p>
          </div>
        `;

        fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sender: { name: "GamesHut Daily", email: "daily@gameshut.ng" },
            to: [{ email: p.email, name: p.name }],
            subject: currentStreak > 0 ? `Your daily games are live! 🔥 Keep your ${currentStreak}-day streak alive!` : "Your daily games are live! 🎮",
            htmlContent: emailHtml
          })
        }).catch(e => console.error("Failed to send morning live email to", p.email, e));
      }
    });
    
    await writeDb(db);
  }

  return NextResponse.json({ success: true, message: "Push notifications dispatched." });
}
