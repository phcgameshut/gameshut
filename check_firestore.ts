import { readDb } from "./src/lib/serverDb";
(async () => {
  try {
    const data = await readDb();
    const players = (data as any)?.players || (data as any)?.gh_players || [];
    console.log("Total players in Firestore:", players.length);
    players.forEach((p: any) => console.log(`  - ${p.email} / ${p.username}`));
    console.log("\nEvents:", ((data as any)?.events || (data as any)?.gh_events || []).length);
    console.log("Products:", ((data as any)?.products || (data as any)?.gh_products || []).length);
    console.log("Tickets:", ((data as any)?.tickets || (data as any)?.gh_tickets || []).length);
    console.log("Daily challenges:", ((data as any)?.daily_challenges || (data as any)?.gh_daily_challenges || []).length);
  } catch(e) {
    console.error(e);
  }
})();
