"use client";

import { useEffect, useState, useRef } from "react";
import { DailyChallenge, storage, GameAttempt } from "@/lib/storage";
import DailyTrivia from "./components/DailyTrivia";
import WordHunt from "./components/WordHunt";
import MatchUp from "./components/MatchUp";
import WhoAmI from "./components/WhoAmI";
import Mystery from "./components/Mystery";
import Link from "next/link";
import { getPlayerAvatarSVG } from "../login/page";
import { showToast } from "@/lib/toast";
import ShareResult from "./components/ShareResult";

export default function GamesHub() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Sync attempts and XP transactions from server so local storage is up to date
    storage.syncFromServer().then(() => {
      // Fetch today's challenges
      fetch("/api/games/today", { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.challenges) {
            setChallenges(data.challenges);
          }
          setLoading(false);
        })
        .catch(e => {
          console.error("Failed to load today's challenges", e);
          setLoading(false);
        });
    });

    // Request push notification permission via custom modal
    const checkPush = async () => {
      try {
        const snoozeUntil = localStorage.getItem("gh_push_snooze");
        if (snoozeUntil && Date.now() < parseInt(snoozeUntil)) return;
      } catch (e) {
        // localStorage is not available (e.g. strict incognito)
      }

      const perm = ("Notification" in window) ? Notification.permission : "default";
      if (perm === "default") {
        setTimeout(() => {
          setShowPushModal(true);
        }, 3000);
      }
    };
    checkPush();
  }, []);

  const [activeGame, setActiveGame] = useState<DailyChallenge | null>(null);
  const [showPushModal, setShowPushModal] = useState(false);
  const activeGameRef = useRef<DailyChallenge | null>(null);
  const [lastXpCount, setLastXpCount] = useState(-1);

  const handleEnablePush = () => {
    if (!("Notification" in window)) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        alert("To enable Push Notifications on iPhone, tap the Share icon at the bottom of Safari, and select 'Add to Home Screen'. Then open GamesHut from your home screen.");
      } else {
        alert("Push notifications are not supported on your current browser or device.");
      }
      // Snooze indefinitely (365 days) for unsupported browsers to stop bothering them
      localStorage.setItem("gh_push_snooze", (Date.now() + 365 * 24 * 60 * 60 * 1000).toString());
      setShowPushModal(false);
      return;
    }
    
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        showToast("Notifications enabled!", "success");
        try {
          new Notification("GamesHut", {
            body: "You'll now be notified when new games are live or when you earn points!",
            icon: "/gameshut_favicon_1784316297649.png"
          });
        } catch (e) {
          // Chrome Android requires a Service Worker for this constructor, so we ignore the error
          console.log("Test notification suppressed due to browser restrictions.");
        }
      }
      setShowPushModal(false);
    }).catch(err => {
      console.error("Push permission error:", err);
      setShowPushModal(false);
    });
  };
  
  useEffect(() => {
    const userId = sessionStorage.getItem("gh_user_id");
    
    // Poll for cross-device push notifications
    const xpPoll = setInterval(async () => {
      if (!userId || !("Notification" in window) || Notification.permission !== "granted") return;
      
      await storage.syncFromServer();
      const userXp = storage.getXpTransactions().filter(xp => xp.userId === userId);
      
      setLastXpCount(prev => {
        if (prev !== -1 && userXp.length > prev) {
          const newXp = userXp[0]; // Assuming newest is first or last, actually let's just trigger generic
          new Notification("GamesHut Points Added!", {
            body: "You just earned some new points! Check your profile.",
            icon: "/gameshut_favicon_1784316297649.png"
          });
        }
        return userXp.length;
      });
    }, 15000);

    return () => clearInterval(xpPoll);
  }, []);

  useEffect(() => {
    activeGameRef.current = activeGame;
  }, [activeGame]);
  
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completedGameData, setCompletedGameData] = useState<{ score: number, maxScore: number, isGuest: boolean, gameType: string, challengeNumber: number, resultData: any } | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && activeGameRef.current) {
        handleGameComplete(0, { reason: "minimized_tab" });
        setShowAntiCheatModal(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleGameComplete = async (score: number, resultData: any) => {
    if (!activeGame) return;
    const currentGame = activeGame; // Capture reference
    setActiveGame(null); // Instantly unmount to prevent double clicks
    
    const userId = localStorage.getItem("gh_session_user_id") || "guest";
    const attempt: GameAttempt = {
      id: "att_" + Math.random().toString(36).substr(2, 9),
      userId,
      challengeId: currentGame.id,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      score: score,
      normalizedScore: score, // Adjust later based on game type
      attemptCount: 1,
      hintsUsed: 0,
      won: score > 0, // Simplified for now
      resultData
    };

    setIsSaving(true);

    const currentAttempts = storage.getGameAttempts();
    await storage.setGameAttempts([attempt, ...currentAttempts]);
    
    // Update streak if not guest
    if (userId !== "guest") {
      const { updateStreak } = await import("@/lib/games/engine");
      await updateStreak(userId, currentGame.gameTypeId);
      
      const { awardXP } = await import("@/lib/games/xp");
      await awardXP(userId, currentGame.gameTypeId, score, score > 0);
    }
    
    setIsSaving(false);
    setRefreshKey(prev => prev + 1);
    
    let maxScore = 100;
    if (currentGame.gameTypeId === "word-hunt" && currentGame.content?.wordsToFind) maxScore = currentGame.content.wordsToFind.length * 20;
    if (currentGame.gameTypeId === "match-up" && currentGame.content?.pairs) maxScore = currentGame.content.pairs.length * 20;

    setCompletedGameData({ score, maxScore, isGuest: userId === "guest", gameType: currentGame.gameTypeId, challengeNumber: currentGame.challengeNumber, resultData });
  };

  if (loading) {
    return <div className="container" style={{ padding: "100px 20px", textAlign: "center" }}>Loading today's games...</div>;
  }

  const userId = typeof window !== 'undefined' ? (localStorage.getItem("gh_session_user_id") || "guest") : null;

  if (activeGame) {
    return (
      <div className="container" style={{ padding: "60px 20px", minHeight: "80vh" }}>
        {activeGame.gameTypeId === "trivia" && (
          <DailyTrivia challenge={activeGame} onComplete={handleGameComplete} onCancel={() => setActiveGame(null)} />
        )}
        {activeGame.gameTypeId === "word-hunt" && (
          <WordHunt challenge={activeGame} onComplete={handleGameComplete} onCancel={() => setActiveGame(null)} />
        )}
        {activeGame.gameTypeId === "match-up" && (
          <MatchUp challenge={activeGame} onComplete={handleGameComplete} onCancel={() => setActiveGame(null)} />
        )}
        {activeGame.gameTypeId === "who-am-i" && (
          <WhoAmI challenge={activeGame} onComplete={handleGameComplete} onCancel={() => setActiveGame(null)} />
        )}
        {activeGame.gameTypeId === "mystery" && (
          <Mystery challenge={activeGame} onComplete={handleGameComplete} onCancel={() => setActiveGame(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "60px 20px", minHeight: "80vh" }}>
      <div style={{ textAlign: "center", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px auto" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 6vw, 2.5rem)", fontWeight: 800, marginBottom: "10px", lineHeight: 1.2 }}>GamesHut Daily Games</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "clamp(1rem, 3vw, 1.2rem)", marginBottom: "20px" }}>A new set of games, every single day.</p>
      </div>

      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "16px", padding: "24px", marginBottom: "32px", display: "flex", gap: "20px", alignItems: "center", color: "white", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ background: "rgba(99, 102, 241, 0.2)", width: "60px", height: "60px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#818cf8" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 700, color: "#f8fafc" }}>Play Games, Earn Points, Get Rewards</h3>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.5 }}>
            Every game you play earns you points. You can redeem your points during checkout for huge discounts on <strong>event tickets</strong> or <strong>shop items</strong>!
            {!userId && (
              <> <Link href="/login" style={{ color: "#818cf8", textDecoration: "underline", fontWeight: 600 }}>Create an account</Link> to save your points.</>
            )}
          </p>
        </div>
      </div>

      {!userId && (
        <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid #f59e0b", padding: "16px", borderRadius: "12px", marginBottom: "32px", textAlign: "center" }}>
          <p style={{ color: "#b45309", fontWeight: 600, margin: 0 }}>
            You are playing as a Guest. <Link href="/login" style={{ textDecoration: "underline", color: "#92400e" }}>Sign in</Link> to save your streaks!
          </p>
        </div>
      )}

      {userId && userId !== "guest" && (() => {
        const userStats = storage.getUserGameStats().filter(s => s.userId === userId);
        const totalGamesWon = userStats.reduce((sum, s) => sum + s.gamesWon, 0);
        const player = storage.getPlayers().find(p => p.id === userId);
        const totalPoints = player?.points || 0;
        
        return (
          <div style={{ 
            background: "var(--card-bg, #ffffff)", 
            border: "1px solid var(--card-border, #e2e8f0)", 
            padding: "20px 10px", 
            borderRadius: "16px", 
            marginBottom: "32px", 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px" 
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(0.7rem, 2vw, 0.9rem)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Streak</div>
              <div style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 900, color: "var(--color-brand)" }}>{storage.getUserStreaks().find(s => s.userId === userId)?.currentStreak || 0} <span style={{fontSize:"clamp(1rem, 3vw, 1.2rem)"}}>🔥</span></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(0.7rem, 2vw, 0.9rem)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Total Points</div>
              <div style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 900, color: "#10b981" }}>{totalPoints} <span style={{fontSize:"clamp(1rem, 3vw, 1.2rem)"}}>✨</span></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(0.7rem, 2vw, 0.9rem)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Games Won</div>
              <div style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 900, color: "#f59e0b" }}>{totalGamesWon} <span style={{fontSize:"clamp(1rem, 3vw, 1.2rem)"}}>🏆</span></div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {["trivia", "word-hunt", "match-up", "who-am-i", "mystery"].map(type => {
          const game = challenges.find(c => c.gameTypeId === type);
          const nameMap: Record<string, string> = {
            "trivia": "Daily Trivia",
            "word-hunt": "Word Hunt",
            "match-up": "Match Up",
            "who-am-i": "Who Am I?",
            "mystery": "Daily Mystery"
          };
          
          const hasPlayed = userId && game && storage.getGameAttempts().some(att => att.userId === userId && att.challengeId === game.id);
          
          return (
            <div key={type} style={{ 
              background: "var(--bg-card)", 
              padding: "24px", 
              borderRadius: "16px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>{nameMap[type]}</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
                  {!game ? "Coming soon or generating..." : hasPlayed ? "You've already played this today!" : "Available to play!"}
                </p>
              </div>
              <button 
                onClick={() => game && !hasPlayed && setActiveGame(game)}
                disabled={!game || Boolean(hasPlayed)}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  background: game && !hasPlayed ? "var(--color-brand)" : "var(--bg-secondary)",
                  color: game && !hasPlayed ? "white" : "var(--text-tertiary)",
                  border: "none",
                  fontWeight: 600,
                  cursor: game && !hasPlayed ? "pointer" : "not-allowed"
                }}
              >
                {!game ? "Not Available" : hasPlayed ? "Already Played" : "Play Now"}
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: "60px", padding: "30px", background: "var(--card-bg, #ffffff)", borderRadius: "16px", border: "1px solid var(--card-border, #e2e8f0)" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "15px", color: "var(--text-primary)" }}>Games Leaderboard</h2>
        {!userId || userId === "guest" ? (
          <div style={{ padding: "20px", background: "rgba(99, 102, 241, 0.05)", border: "1px solid var(--accent-primary)", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "15px" }}>Sign up to appear on the leaderboard and save your points!</p>
            <Link href="/login" style={{ display: "inline-block", padding: "10px 24px", background: "var(--color-brand)", color: "#fff", borderRadius: "8px", fontWeight: 700, textDecoration: "none" }}>Create an Account</Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "12px 10px" }}>Rank</th>
                  <th style={{ padding: "12px 10px" }}>Player</th>
                  <th style={{ padding: "12px 10px", textAlign: "right" }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const allPlayers = storage.getPlayers();
                  const userXpMap = new Map<string, number>();
                  
                  // Only count points from games (XP Transactions)
                  
                  storage.getXpTransactions().forEach(tx => {
                    if (tx.userId !== "guest") {
                      userXpMap.set(tx.userId, (userXpMap.get(tx.userId) || 0) + tx.amount);
                    }
                  });

                  const sortedUsers = Array.from(userXpMap.entries())
                    .map(([uId, totalPoints]) => ({ uId, totalPoints }))
                    .filter(stat => allPlayers.some(pl => pl.id === stat.uId))
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .slice(0, 10);
                  
                  return sortedUsers.map((stat, index) => {
                    const p = allPlayers.find(pl => pl.id === stat.uId);
                    if (!p) return null; // Fallback, shouldn't happen due to filter
                    return (
                      <tr key={stat.uId} style={{ borderBottom: "1px solid var(--card-border)", background: stat.uId === userId ? "rgba(16, 185, 129, 0.05)" : "transparent" }}>
                        <td style={{ padding: "16px 10px", fontWeight: 700, color: index < 3 ? "var(--accent-primary)" : "var(--text-secondary)" }}>
                          #{index + 1}
                        </td>
                        <td style={{ padding: "16px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                              {getPlayerAvatarSVG(p.avatar || "gamer", 24)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.name.split(" ")[0]}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>@{p.username || p.name.split(" ")[0].toLowerCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 10px", textAlign: "right", fontWeight: 800, color: "#10b981" }}>
                          {stat.totalPoints} <span style={{fontSize:"0.9rem"}}>✨</span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAntiCheatModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", padding: "40px", borderRadius: "16px", maxWidth: "450px", width: "90%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", animation: "fadeIn 0.3s ease-out", border: "2px solid #ef4444" }}>
            <div style={{ display: "inline-flex", background: "#fef2f2", padding: "15px", borderRadius: "50%", marginBottom: "20px" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
            </div>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", marginBottom: "12px" }}>Anti-Cheat Activated</h3>
            <p style={{ color: "#4b5563", marginBottom: "30px", lineHeight: 1.6, fontSize: "1.05rem" }}>
              You left the game tab! To maintain fair play on the leaderboard, the game was aborted and your score for this challenge has been recorded as <strong style={{color:"#ef4444"}}>0 points</strong>.
            </p>
            <button onClick={() => setShowAntiCheatModal(false)} style={{ width: "100%", background: "#ef4444", padding: "14px", border: "none", borderRadius: "8px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "1.1rem", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#dc2626"} onMouseOut={e => e.currentTarget.style.background = "#ef4444"}>
              I Understand
            </button>
          </div>
        </div>
      )}

      {isSaving && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", padding: "40px", borderRadius: "16px", maxWidth: "450px", width: "90%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", animation: "fadeIn 0.3s ease-out" }}>
            <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderBottomColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" }}></div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#111827" }}>Saving Your Score...</h3>
            <p style={{ color: "#6b7280", marginTop: "10px" }}>Please wait while we update your progress.</p>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          `}} />
        </div>
      )}

      {completedGameData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", padding: "40px", borderRadius: "16px", maxWidth: "450px", width: "90%", maxHeight: "90vh", overflowY: "auto", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", animation: "fadeIn 0.3s ease-out" }}>
            <div style={{ fontSize: "4rem", marginBottom: "15px" }}>{completedGameData.score > 0 ? "🎉" : "😅"}</div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111827", marginBottom: "12px" }}>Game Complete!</h3>
            <div style={{ background: "var(--bg-secondary)", padding: "20px", borderRadius: "12px", marginBottom: "24px" }}>
              <div style={{ fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: "5px" }}>You Scored</div>
              <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--color-brand)" }}>{completedGameData.score} <span style={{fontSize:"1.5rem"}}>✨</span></div>
            </div>
            
            {completedGameData.isGuest ? (
              <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid #f59e0b", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
                <p style={{ color: "#b45309", fontWeight: 600, margin: 0, fontSize: "0.95rem" }}>
                  Sign in to save this score, track your streak, and climb the leaderboard!
                </p>
              </div>
            ) : (
              <p style={{ color: "#10b981", fontWeight: 600, marginBottom: "24px" }}>✓ Progress saved successfully!</p>
            )}
            
            <div style={{ marginBottom: "24px", transform: "scale(0.95)" }}>
              <ShareResult 
                gameType={completedGameData.gameType} 
                score={completedGameData.score} 
                maxScore={completedGameData.maxScore} 
                challengeNumber={completedGameData.challengeNumber} 
                resultData={completedGameData.resultData} 
              />
            </div>
            
            <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
              {completedGameData.isGuest && (
                <Link href="/login" style={{ width: "100%", background: "var(--color-brand)", padding: "14px", border: "none", borderRadius: "8px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "1.1rem", textDecoration: "none" }}>
                  Sign In Now
                </Link>
              )}
              <button onClick={() => setCompletedGameData(null)} style={{ width: "100%", background: completedGameData.isGuest ? "var(--bg-secondary)" : "var(--color-brand)", padding: "14px", border: "none", borderRadius: "8px", color: completedGameData.isGuest ? "var(--text-primary)" : "white", fontWeight: 700, cursor: "pointer", fontSize: "1.1rem" }}>
                Continue
              </button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          `}} />
        </div>
      )}
      {/* Push Notification Custom Modal */}
      {showPushModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "20px"
        }}>
          <div style={{
            background: "white", padding: "30px", borderRadius: "20px",
            maxWidth: "400px", width: "100%", textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            animation: "fadeIn 0.3s ease-out forwards"
          }}>
            <div style={{
              background: "#eff6ff", width: "64px", height: "64px",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 20px"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>Stay in the Loop!</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.5 }}>
              Enable push notifications to get instantly alerted when new daily games are live, and when you earn points on your account.
            </p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button 
                onClick={handleEnablePush}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px",
                  background: "var(--color-brand)", color: "white",
                  border: "none", fontWeight: 700, fontSize: "1.05rem",
                  cursor: "pointer"
                }}
              >
                Enable Notifications
              </button>
              <button 
                onClick={() => {
                  // Snooze for 2 days
                  localStorage.setItem("gh_push_snooze", (Date.now() + 2 * 24 * 60 * 60 * 1000).toString());
                  setShowPushModal(false);
                }}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px",
                  background: "transparent", color: "var(--text-secondary)",
                  border: "1px solid #e2e8f0", fontWeight: 600, fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
