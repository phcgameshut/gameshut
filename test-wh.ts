import { GeminiProvider } from './src/lib/games/generator';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const ai = new GeminiProvider();
  try {
    const res = await ai.generateWordHunt('2026-08-16');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('FAILED TO GENERATE:', e);
  }
}
run();
