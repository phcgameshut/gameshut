import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbData = await readDb();
  return NextResponse.json(
    { success: true, data: dbData },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store"
      }
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }
    
    const currentDb = (await readDb()) || {};
    const updatedDb: any = { ...currentDb };
    
    // High-frequency keys that suffer from concurrent overwrite race conditions.
    // We MUST merge these by ID rather than blindly overwriting.
    const MERGE_KEYS = [
      "game_attempts", 
      "xp_transactions", 
      "user_streaks", 
      "game_streaks", 
      "user_game_stats",
      "players",
      "teams",
      "notifications"
    ];
    
    for (const [key, value] of Object.entries(body)) {
      if (MERGE_KEYS.includes(key) && Array.isArray(value) && Array.isArray(currentDb[key])) {
        const existingMap = new Map();
        // Add existing server data first
        for (const item of currentDb[key]) {
          if (item && item.id) existingMap.set(item.id, item);
        }
        // Upsert with field-level merge — incoming client data overlays existing, preserving any fields not sent
        for (const item of (value as any[])) {
          if (item && item.id) {
            if (key === "players" && existingMap.has(item.id)) {
              const serverPlayer = existingMap.get(item.id);
              // Points are server-only — clients can NEVER change them via this endpoint
              // (use /api/games/award-xp or /api/admin/fix-points instead)
              item.points = serverPlayer.points;
              item.voucherWalletBalance = serverPlayer.voucherWalletBalance;
            }
            // Field-level merge: preserve existing fields not present in incoming payload
            existingMap.set(item.id, { ...existingMap.get(item.id), ...item });
          }
        }
        updatedDb[key] = Array.from(existingMap.values());
      } else {
        // Normal overwrite for other keys
        updatedDb[key] = value;
      }
    }
    
    await writeDb(updatedDb);
    
    return NextResponse.json({ success: true, data: updatedDb });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
