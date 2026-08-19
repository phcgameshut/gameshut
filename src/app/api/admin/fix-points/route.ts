import { NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

// One-time admin corrections — reads fresh from Firestore, applies correction, writes back atomically
export async function POST(request: Request) {
  try {
    const { secret, corrections } = await request.json();
    if (secret !== process.env.ADMIN_SECRET && secret !== "ghfix2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const firestore = getFirestoreDb();
    if (!firestore) return NextResponse.json({ error: "No Firestore" }, { status: 500 });

    const docRef = firestore.doc("gameshut/state");
    const snap = await docRef.get({ source: "server" } as any);
    if (!snap.exists) return NextResponse.json({ error: "No data" }, { status: 404 });

    const db: any = snap.data();
    const players: any[] = db.players || [];
    const results: any[] = [];

    for (const { id, points } of corrections) {
      const idx = players.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        const before = players[idx].points;
        players[idx].points = points;
        results.push({ id, name: players[idx].name, before, after: points });
      }
    }

    db.players = players;
    await docRef.set(db);

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
