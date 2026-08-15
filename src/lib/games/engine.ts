import { storage, UserStreak, GameStreak, GameTypeSlug } from "@/lib/storage";

export const getWatDateString = (date = new Date()) => {
  const watTime = new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  return watTime.toISOString().split('T')[0];
};

/**
 * Validates if the current date is sequential to the last qualified date.
 * Allows playing multiple times the same day without resetting.
 */
export const isNextDay = (lastDateStr: string, currentDateStr: string) => {
  if (lastDateStr === currentDateStr) return "SAME_DAY";
  
  const last = new Date(lastDateStr);
  const current = new Date(currentDateStr);
  const diffTime = Math.abs(current.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays === 1) return "NEXT_DAY";
  return "STREAK_BROKEN";
};

export const updateStreak = async (userId: string, gameTypeId: GameTypeSlug | undefined, isWin: boolean = true) => {
  if (userId === "guest") return;

  const todayStr = getWatDateString();

  if (gameTypeId) {
    const allGameStreaks = storage.getGameStreaks();
    let gameStreak = allGameStreaks.find(s => s.userId === userId && s.gameTypeId === gameTypeId);
    
    if (!gameStreak) {
      gameStreak = { userId, gameTypeId, currentStreak: 1, longestStreak: 1, lastQualifiedDate: todayStr };
      await storage.setGameStreaks([...allGameStreaks, gameStreak]);
    } else {
      const state = isNextDay(gameStreak.lastQualifiedDate || "", todayStr);
      if (state === "NEXT_DAY" && isWin) {
        gameStreak.currentStreak += 1;
        if (gameStreak.currentStreak > gameStreak.longestStreak) {
          gameStreak.longestStreak = gameStreak.currentStreak;
        }
        gameStreak.lastQualifiedDate = todayStr;
      } else if (state === "STREAK_BROKEN" || !isWin) {
        gameStreak.currentStreak = isWin ? 1 : 0;
        gameStreak.lastQualifiedDate = todayStr;
      }
      // if SAME_DAY, do nothing
      
      const filtered = allGameStreaks.filter(s => !(s.userId === userId && s.gameTypeId === gameTypeId));
      await storage.setGameStreaks([...filtered, gameStreak]);
    }
  }

  // Update Global User Streak (Requires completing at least one game)
  const allUserStreaks = storage.getUserStreaks();
  let userStreak = allUserStreaks.find(s => s.userId === userId);

  if (!userStreak) {
    userStreak = { userId, currentStreak: 1, longestStreak: 1, lastQualifiedDate: todayStr, updatedAt: new Date().toISOString() };
    await storage.setUserStreaks([...allUserStreaks, userStreak]);
  } else {
    const state = isNextDay(userStreak.lastQualifiedDate || "", todayStr);
    if (state === "NEXT_DAY" && isWin) {
      userStreak.currentStreak += 1;
      if (userStreak.currentStreak > userStreak.longestStreak) {
        userStreak.longestStreak = userStreak.currentStreak;
      }
      userStreak.lastQualifiedDate = todayStr;
      userStreak.updatedAt = new Date().toISOString();
    } else if (state === "STREAK_BROKEN" || !isWin) {
      userStreak.currentStreak = isWin ? 1 : 0;
      userStreak.lastQualifiedDate = todayStr;
      userStreak.updatedAt = new Date().toISOString();
    }
    
    const filtered = allUserStreaks.filter(s => s.userId !== userId);
    await storage.setUserStreaks([...filtered, userStreak]);
  }
};
