import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export async function POST(request: Request) {
  try {
    const { userId, gameTypeId, score, attemptId } = await request.json();

    if (!userId || userId === "guest" || !gameTypeId || score === undefined) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const amount = Math.min(100, Math.max(0, Math.round(score)));

    const dbData = await readDb();
    if (!dbData) {
      return NextResponse.json({ success: false, error: "DB uninitialized" }, { status: 500 });
    }

    const players = dbData.players || [];
    const playerIndex = players.findIndex((p: any) => p.id === userId);
    if (playerIndex === -1) {
      return NextResponse.json({ success: false, error: "Player not found" }, { status: 404 });
    }

    // Idempotency: check if this attempt was already awarded
    const xpTransactions: any[] = dbData.xp_transactions || [];
    const alreadyAwarded = xpTransactions.some((t: any) => t.sourceId === attemptId);
    if (alreadyAwarded) {
      return NextResponse.json({ success: true, skipped: true, message: "Already awarded" });
    }

    // Award points directly on server
    players[playerIndex].points = (players[playerIndex].points || 0) + amount;
    players[playerIndex].voucherWalletBalance = (players[playerIndex].voucherWalletBalance || 0) + 10;

    // Record XP transaction
    const tx = {
      id: "xp_" + Math.random().toString(36).substr(2, 9),
      userId,
      amount,
      reason: `Completed ${gameTypeId}`,
      createdAt: new Date().toISOString(),
      sourceId: attemptId,
    };
    xpTransactions.unshift(tx);

    // Record game attempt
    const gameAttempts: any[] = dbData.game_attempts || [];
    const existingAttempt = gameAttempts.find((a: any) => a.id === attemptId);
    if (!existingAttempt) {
      gameAttempts.unshift({
        id: attemptId,
        userId,
        gameTypeId,
        score,
        completedAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        won: score > 0,
      });
    }

    dbData.players = players;
    dbData.xp_transactions = xpTransactions;
    dbData.game_attempts = gameAttempts;

    await writeDb(dbData);

    return NextResponse.json({
      success: true,
      newPoints: players[playerIndex].points,
      xpAwarded: amount,
    });
  } catch (err: any) {
    console.error("Award XP error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
