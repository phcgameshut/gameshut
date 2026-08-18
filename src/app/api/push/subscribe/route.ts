import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export async function POST(request: Request) {
  try {
    const { userId, subscription } = await request.json();

    if (!userId || !subscription) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const dbData = await readDb();
    if (!dbData) {
      return NextResponse.json({ success: false, error: "DB uninitialized" }, { status: 500 });
    }

    const players = dbData.players || [];
    const playerIndex = players.findIndex((p: any) => p.id === userId);

    if (playerIndex === -1) {
      return NextResponse.json({ success: false, error: "Player not found" }, { status: 404 });
    }

    players[playerIndex].pushSubscription = subscription;
    dbData.players = players;

    await writeDb(dbData);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Push subscribe error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
