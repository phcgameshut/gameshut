const http = require('http');

const now = new Date();
const watTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
const todayStr = watTime.toISOString().split('T')[0];

const testTrivia = {
  id: "chal_" + Math.random().toString(36).substr(2, 9),
  gameTypeId: "trivia",
  challengeNumber: 1,
  challengeDate: todayStr,
  content: {
    questions: [
      {
        q: "What is the capital of Nigeria?",
        options: ["Lagos", "Abuja", "Kano", "Port Harcourt"],
        answer: "Abuja",
        explanation: "Abuja replaced Lagos as the capital in 1991."
      },
      {
        q: "In what year did Nigeria gain independence?",
        options: ["1957", "1960", "1963", "1966"],
        answer: "1960",
        explanation: "Nigeria gained independence from the UK on October 1, 1960."
      }
    ]
  },
  solution: {},
  difficulty: "easy",
  category: "General",
  status: "LIVE",
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
};

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/db',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const db = JSON.parse(data).data || {};
    const currentChallenges = db.gh_daily_challenges || [];
    const filtered = currentChallenges.filter(c => !(c.gameTypeId === "trivia" && c.challengeDate === todayStr));
    
    const postData = JSON.stringify({
      gh_daily_challenges: [testTrivia, ...filtered]
    });

    const postReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/db',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (postRes) => {
      console.log('STATUS: ' + postRes.statusCode);
      console.log('Injected successfully via API.');
    });

    postReq.write(postData);
    postReq.end();
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.end();
