async function run() {
  try {
    console.log("Fetching DB...");
    const res = await fetch('https://gameshut.ng/api/db');
    const db = await res.json();
    if (!db || !db.data) {
      console.log("No data:", db);
      return;
    }
    const attempts = db.data.game_attempts || [];
    console.log("Total attempts before:", attempts.length);
    const filtered = attempts.filter(a => a.userId !== "guest");
    console.log("Total attempts after:", filtered.length);
    
    if (filtered.length !== attempts.length) {
      console.log("Updating DB...");
      const postRes = await fetch(res.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_attempts: filtered })
      });
      const postJson = await postRes.json();
      console.log("Update response:", postJson.success);
    } else {
      console.log("No guest attempts found on server DB!");
    }
  } catch (e) {
    console.error(e);
  }
}
run();
