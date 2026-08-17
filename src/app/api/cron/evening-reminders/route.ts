import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export const maxDuration = 60;

const STREAK_MESSAGES = [
  "[Name], have you abandoned me? Your [Streak]-day streak is on the line. Log in and play now!",
  "Don't lose your [Streak]-day streak! The daily games are waiting for you.",
  "Your streak is in danger, [Name]. Play your daily games to keep your [Streak]-day streak alive!",
  "We miss you, [Name]! Log in now to maintain your [Streak]-day streak.",
  "Time is running out to save your [Streak]-day streak! Play your daily games now."
];

const ENCOURAGING_MESSAGES = [
  "Hey [Name]! Ready to start a new streak? Today's games are fresh and waiting for you.",
  "Time to get back in the game, [Name]. Start your winning streak today!",
  "[Name], it's a great day to play! Log in now to conquer today's challenges.",
  "Your daily puzzles are ready, [Name]. Can you beat your high score today?",
  "Jump back in, [Name]! Discover today's mysteries and earn points for your team."
];

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
  const attempts = db.game_attempts || [];
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (players.length > 0) {
    console.log(`Sending Evening Streak Reminders to ${players.length} players...`);
    
    for (const player of players) {
      if (!player.email) continue;
      
      // Don't send reminder if they already played today
      const hasPlayedToday = attempts.some((a: any) => a.userId === player.id && a.challengeDate === todayStr);
      if (hasPlayedToday) continue;
      
      const userStreak = streaks.find((s: any) => s.userId === player.id);
      const currentStreak = userStreak ? userStreak.currentStreak : 0;
      
      let messageTemplate = "";
      if (currentStreak > 0) {
        messageTemplate = STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];
      } else {
        messageTemplate = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
      }
      
      const bodyText = messageTemplate
        .replace("[Name]", player.name.split(" ")[0])
        .replace("[Streak]", currentStreak.toString());
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; text-align: center;">
          <h2 style="color: #6366f1;">GamesHut Arena</h2>
          <p style="font-size: 16px; color: #334155; margin-bottom: 30px;">${bodyText}</p>
          <a href="https://gameshut.ng/games" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Play Daily Games</a>
          <p style="margin-top: 40px; font-size: 12px; color: #94a3b8;">You are receiving this because you are registered on GamesHut. Please do not reply to this email (daily@gameshut.ng).</p>
        </div>
      `;

      // Dispatch via Brevo
      try {
        if (process.env.BREVO_API_KEY) {
          await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": process.env.BREVO_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              sender: { name: "GamesHut Daily", email: "daily@gameshut.ng" },
              to: [{ email: player.email, name: player.name }],
              subject: currentStreak > 0 ? `Protect your ${currentStreak}-day streak!` : "Your daily games are ready!",
              htmlContent: emailHtml
            })
          });
        } else {
          // Fallback to local email log for testing
          if (!db.email_logs) db.email_logs = [];
          db.email_logs.push({
            id: "em_" + Math.random().toString(36).substr(2, 9),
            recipientEmail: player.email,
            recipientName: player.name,
            subject: currentStreak > 0 ? `Protect your ${currentStreak}-day streak!` : "Your daily games are ready!",
            bodyHtml: emailHtml,
            sentAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.error("Failed to dispatch evening reminder to", player.email, e);
      }
    }
    
    await writeDb(db);
  }

  return NextResponse.json({ success: true, message: "Evening reminders dispatched." });
}
