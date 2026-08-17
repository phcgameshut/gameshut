import { config } from "dotenv";
config({ path: ".env.local" });

import { GET } from "./src/app/api/cron/publish-daily/route";

(async () => {
  console.log("Triggering publish-daily manually...");
  const res = await GET({ headers: new Map() } as any);
  console.log("Publish finished:", await res.json());
})();
