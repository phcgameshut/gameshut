import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { GoogleGenAI } from '@google/genai';

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.list();
    for await (const model of response) {
      if (model.name.includes("flash")) {
        console.log(model.name);
      }
    }
  } catch (e) {
    console.error("Failed:", e);
  }
}
test();
