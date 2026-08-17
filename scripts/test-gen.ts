import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { GoogleGenAI } from '@google/genai';

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: "Hello"
    });
    console.log("Success gemini-1.5-flash:", res.text);
  } catch (e) {
    console.error("Failed gemini-1.5-flash:", e.message);
  }
}
test();
