import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

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
    const updatedDb = { ...currentDb, ...body };
    await writeDb(updatedDb);
    
    return NextResponse.json({ success: true, data: updatedDb });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
