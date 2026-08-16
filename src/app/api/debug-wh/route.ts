import { NextResponse } from "next/server";
import { GeminiProvider } from "@/lib/games/generator";

export async function GET(request: Request) {
  try {
    const ai = new GeminiProvider();
    const res = await ai.generateWordHunt("2026-08-16");
    return NextResponse.json({ success: true, res });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
