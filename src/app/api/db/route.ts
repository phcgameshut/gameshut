import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbData = await readDb();
  return NextResponse.json({ success: true, data: dbData });
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
      "teams"
    ];
    
    for (const [key, value] of Object.entries(body)) {
      if (MERGE_KEYS.includes(key) && Array.isArray(value) && Array.isArray(currentDb[key])) {
        const existingMap = new Map();
        // Add existing server data first
        for (const item of currentDb[key]) {
          if (item && item.id) existingMap.set(item.id, item);
        }
        // Upsert client data (client data wins conflicts)
        for (const item of (value as any[])) {
          if (item && item.id) {
            existingMap.set(item.id, item);
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
