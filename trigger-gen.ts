import { config } from "dotenv";
config({ path: ".env.local" });

import { maintainChallengeQueue } from "./src/lib/games/generator";

(async () => {
  console.log("Triggering generation manually...");
  await maintainChallengeQueue();
  console.log("Generation finished.");
})();
