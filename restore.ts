import fs from "fs";
import { writeDb } from "./src/lib/serverDb";
(async () => {
  try {
    const data = fs.readFileSync("src/lib/serverDb.json", "utf8");
    const parsed = JSON.parse(data);
    await writeDb(parsed);
    console.log("Successfully restored Firestore from local backup.");
  } catch(e) {
    console.error(e);
  }
})();
