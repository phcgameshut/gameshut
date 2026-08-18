import { NextResponse } from "next/server";
import { readDb } from "@/lib/serverDb";
import webpush from "web-push";

// Configure web-push
webpush.setVapidDetails(
  "mailto:itzthunderlee@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function POST(request: Request) {
  try {
    const { title, message, url } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const dbData = await readDb();
    if (!dbData) {
      return NextResponse.json({ success: false, error: "DB uninitialized" }, { status: 500 });
    }

    const players = dbData.players || [];
    const subscribedPlayers = players.filter((p: any) => p.pushSubscription);

    if (subscribedPlayers.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, message: "No users are subscribed to push notifications." });
    }

    let successCount = 0;
    let failCount = 0;

    const payload = JSON.stringify({
      title,
      message,
      url: url || "/"
    });

    const promises = subscribedPlayers.map(async (player: any) => {
      try {
        await webpush.sendNotification(player.pushSubscription, payload);
        successCount++;
      } catch (error) {
        console.error(`Failed to send push to ${player.email}:`, error);
        failCount++;
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, sentCount: successCount, failCount });
  } catch (err: any) {
    console.error("Push send error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
