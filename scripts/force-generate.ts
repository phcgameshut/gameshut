import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { GeminiProvider } from '../src/lib/games/generator';
import { maintainChallengeQueue } from '../src/lib/games/generator';

// Override the GeminiProvider retry to wait 65 seconds to bypass RPM limit safely!
const originalRetry = GeminiProvider.prototype['retryWithBackoff'];
GeminiProvider.prototype['retryWithBackoff'] = async function(fn, maxRetries = 5) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
      if (isRateLimit && attempt < maxRetries) {
        console.log(`[LOCAL SCRIPT] Rate limited. Sleeping for 60 seconds (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(res => setTimeout(res, 60000));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries exceeded");
};

async function run() {
  console.log("Starting forced generation with 60s rate limit handling...");
  try {
    await maintainChallengeQueue();
    console.log("Generation complete!");
  } catch (err) {
    console.error("Error generating:", err);
  }
}

run();
