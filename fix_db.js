const https = require('https');
const http = require('http');

function fetchDb() {
  return new Promise((resolve, reject) => {
    https.get('https://gameshut.ng/api/db', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

function updateDb(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request('https://gameshut.ng/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let response = '';
      res.on('data', chunk => response += chunk);
      res.on('end', () => resolve(response));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  try {
    console.log("Fetching DB...");
    const db = await fetchDb();
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
      const res = await updateDb({ game_attempts: filtered });
      console.log("Update response:", res);
    } else {
      console.log("No guest attempts found on server DB!");
    }
  } catch (e) {
    console.error(e);
  }
}

run();
