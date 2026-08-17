import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export const maxDuration = 60;

const STREAK_MESSAGES = [
  "[Name], have you abandoned me? Your [Streak]-day streak is begging for its life! Log in and play now!",
  "Don't break my heart, [Name]! The daily games are waiting for you.",
  "Your streak is in critical danger, [Name]. Play your daily games to keep the fire alive!",
  "I'm literally crying right now, [Name]! Log in now to maintain your [Streak]-day streak.",
  "Prove your loyalty to GamesHut, [Name]! Time is running out to save your [Streak]-day streak."
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
      const hasPlayedToday = attempts.some((a: any) => a.userId === player.id && a.startedAt && a.startedAt.startsWith(todayStr));
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
      
      const mascotEmoji = currentStreak > 0 ? "🥺" : "🎮";

      // Calculate last 7 days for the streak calendar
      const today = new Date();
      const last7Days = Array.from({length: 7}).map((_, i) => {
         const d = new Date(today);
         d.setDate(today.getDate() - (6 - i));
         return d.toISOString().split('T')[0];
      });
      const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      
      const streakBubblesHtml = last7Days.map((dayStr, index) => {
        const d = new Date(dayStr);
        const dayName = daysOfWeek[d.getDay()];
        const isToday = index === 6;
        const playedThisDay = attempts.some((a: any) => a.userId === player.id && a.startedAt && a.startedAt.startsWith(dayStr));
        
        const bgColor = playedThisDay ? "#3b82f6" : "transparent"; // Duolingo blue
        const borderColor = playedThisDay ? "#3b82f6" : "#cbd5e1";
        const borderStyle = isToday && !playedThisDay ? "dashed" : "solid";
        
        return `
          <div style="display: inline-block; margin: 0 2px; text-align: center;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: bold;">${dayName}</div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${bgColor}; border: 2px ${borderStyle} ${borderColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto; line-height: 28px;">
              ${playedThisDay ? '<span style="color: white; font-size: 14px; display: inline-block;">✓</span>' : ''}
            </div>
          </div>
        `;
      }).join('');
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px 0; min-height: 100%;">
          <div style="background-color: #ffffff; padding: 40px 20px; max-width: 500px; margin: 0 auto; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center;">
            <h1 style="color: #6366f1; margin: 0 0 24px 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">gameshut</h1>
            
            <a href="https://gameshut.ng/games" style="display: block; background-color: #3b82f6; color: white; padding: 16px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 40px; box-shadow: 0 4px 0 #2563eb;">
              START A GAME
            </a>
            
            <div style="font-size: 80px; margin-bottom: 20px; line-height: 1;">${mascotEmoji}</div>
            
            <h2 style="color: #1e293b; font-size: 22px; margin: 0 0 12px 0;">Play thy GamesHut!</h2>
            <p style="font-size: 16px; color: #475569; margin: 0 0 40px 0; line-height: 1.5;">${bodyText}</p>
            
            <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 20px;">
              <div style="background-color: #f59e0b; padding: 16px 20px; text-align: left;">
                <span style="color: white; font-weight: 800; font-size: 18px;">Current streak: ${currentStreak}</span>
                <span style="font-size: 20px; float: right;">🔥</span>
              </div>
              <div style="padding: 20px 10px; display: flex; justify-content: space-around;">
                ${streakBubblesHtml}
              </div>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0 20px 0;">
            
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
              You are receiving these emails because you are subscribed to <strong>GamesHut</strong> practice reminders.<br>
              <a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
            </p>
          </div>
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
