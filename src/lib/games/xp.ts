import { storage, XPTransaction, UserGameStats } from "@/lib/storage";
import { getWatDateString } from "./engine";

export const awardXP = async (userId: string, gameTypeId: string, score: number, isWin: boolean) => {
  if (userId === "guest") return;

  const todayStr = getWatDateString();
  
  // Base XP based on score
  let amount = Math.floor(score * 10);
  
  // Win bonus
  if (isWin) {
    amount += 50;
  }

  const tx: XPTransaction = {
    id: "xp_" + Math.random().toString(36).substr(2, 9),
    userId,
    amount,
    reason: `Completed ${gameTypeId} on ${todayStr}`,
    createdAt: new Date().toISOString(),
    sourceId: "daily_" + todayStr
  };

  const allTx = storage.getXpTransactions();
  await storage.setXpTransactions([tx, ...allTx]);

  // Update Stats
  const allStats = storage.getUserGameStats();
  let stats = allStats.find(s => s.userId === userId && s.gameTypeId === gameTypeId);

  if (!stats) {
    stats = { 
      userId, 
      gameTypeId: gameTypeId as any,
      gamesPlayed: 1, 
      gamesWon: isWin ? 1 : 0, 
      perfectGames: 0,
      totalScore: score,
      averageScore: score
    };
    await storage.setUserGameStats([...allStats, stats]);
  } else {
    stats.gamesPlayed += 1;
    if (isWin) stats.gamesWon += 1;
    stats.totalScore += score;
    stats.averageScore = stats.totalScore / stats.gamesPlayed;
    
    const filtered = allStats.filter(s => !(s.userId === userId && s.gameTypeId === gameTypeId));
    await storage.setUserGameStats([...filtered, stats]);
  }
};
