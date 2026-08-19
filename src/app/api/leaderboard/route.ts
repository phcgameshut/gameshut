import { NextResponse } from "next/server";
import { readDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await readDb();
    if (!db) return NextResponse.json({ success: false, error: "DB uninitialized" }, { status: 500 });

    const players: any[] = (db.players || []).filter((p: any) => p.role !== "admin");
    const gameAttempts: any[] = db.game_attempts || [];
    const userStreaks: any[] = db.user_streaks || [];
    const gameStreaks: any[] = db.game_streaks || [];
    const userGameStats: any[] = db.user_game_stats || [];

    // Build enriched player list
    const enriched = players.map((p: any) => {
      const streak = userStreaks.find((s: any) => s.userId === p.id);
      const stats = userGameStats.filter((s: any) => s.userId === p.id);
      const totalGamesPlayed = stats.reduce((sum: number, s: any) => sum + (s.gamesPlayed || 0), 0);
      const totalGamesWon = stats.reduce((sum: number, s: any) => sum + (s.gamesWon || 0), 0);
      const myAttempts = gameAttempts.filter((a: any) => a.userId === p.id);
      const myGameStreaks = gameStreaks.filter((s: any) => s.userId === p.id);
      return {
        id: p.id,
        name: p.name,
        username: p.username,
        avatar: p.avatar,
        teamId: p.teamId,
        role: p.role,
        points: p.points || 0,
        voucherWalletBalance: p.voucherWalletBalance || 0,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        totalGamesPlayed,
        totalGamesWon,
        gameStreaks: myGameStreaks,
        recentAttempts: myAttempts.slice(0, 10),
      };
    });

    const sortedByPoints = [...enriched].sort((a, b) => b.points - a.points);
    const sortedByStreak = [...enriched].sort((a, b) => b.longestStreak - a.longestStreak);
    const teams: any[] = db.teams || [];

    return NextResponse.json({
      success: true,
      players: sortedByPoints,
      playersByStreak: sortedByStreak,
      teams,
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
