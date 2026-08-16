import { storage, XPTransaction, UserGameStats } from "@/lib/storage";
import { getWatDateString } from "./engine";

export const awardXP = async (userId: string, gameTypeId: string, score: number, isWin: boolean) => {
  if (userId === "guest") return;

  const todayStr = getWatDateString();
  
  // Score scaled to maximum of 100 points
  const amount = Math.min(100, Math.max(0, score));

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

  if (amount > 0) {
    storage.addNotification(
      userId,
      "Points Earned!",
      `You just earned ${amount} points for playing ${gameTypeId}.`,
      "system"
    );
  }

  // Award points to global player object
  const players = storage.getPlayers();
  const playerIndex = players.findIndex(p => p.id === userId);
  if (playerIndex !== -1) {
    players[playerIndex].voucherWalletBalance += 10;
    players[playerIndex].points = (players[playerIndex].points || 0) + amount;
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
