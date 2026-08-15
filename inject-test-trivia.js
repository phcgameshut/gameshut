const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'src', 'lib', 'serverDb.json');

function getDb() {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  return {};
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const db = getDb();

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

const currentChallenges = db.gh_daily_challenges || [];
// Remove any existing test trivia for today
const filtered = currentChallenges.filter(c => !(c.gameTypeId === "trivia" && c.challengeDate === todayStr));
db.gh_daily_challenges = [testTrivia, ...filtered];

saveDb(db);
console.log("Injected test trivia for " + todayStr);
