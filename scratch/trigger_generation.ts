import { maintainChallengeQueue } from "./src/lib/games/generator";
import { config } from "dotenv";
config({ path: ".env.local" });

(async () => {
  try {
    console.log("Starting generation...");
    await maintainChallengeQueue();
    console.log("Done.");
  } catch (err) {
    console.error("Failed:", err);
  }
})();
