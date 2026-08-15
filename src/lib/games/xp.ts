import { storage, XPTransaction, UserGameStats } from "@/lib/storage";
import { getWatDateString } from "./engine";

export const awardXP = async (userId: string, gameTypeId: string, score: number, isWin: boolean) => {
  if (userId === "guest") return;

  const todayStr = getWatDateString();
  
  // Fixed 100 points per completed game, 0 if score is 0 (gave up/failed)
  const amount = score > 0 ? 100 : 0;

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

  // Award 10 Voucher Points
  const players = storage.getPlayers();
  const playerIndex = players.findIndex(p => p.id === userId);
  if (playerIndex !== -1) {
    players[playerIndex].voucherWalletBalance += 10;
    await storage.setPlayers(players);
  }

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
