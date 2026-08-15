"use client";

import { useEffect, useState } from "react";
import { DailyChallenge, storage, GameAttempt } from "@/lib/storage";
import DailyTrivia from "./components/DailyTrivia";
import WordHunt from "./components/WordHunt";
import MatchUp from "./components/MatchUp";
import WhoAmI from "./components/WhoAmI";
import Mystery from "./components/Mystery";
import Link from "next/link";
import { getPlayerAvatarSVG } from "../login/page";
import { showToast } from "@/lib/toast";

export default function GamesHub() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Fetch today's challenges
    fetch("/api/games/today")
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

    // Request push notification permission
    const checkPush = async () => {
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") {
        setTimeout(() => {
          if (confirm("Enable push notifications to know when new daily games are live?")) {
            Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                showToast("Notifications enabled!", "success");
                new Notification("GamesHut", {
                  body: "Today's games are live! Come play to keep your streak.",
                  icon: "/gameshut_favicon_1784316297649.png"
                });
              }
            });
          }
        }, 3000);
      }
    };
    checkPush();
  }, []);

  const [activeGame, setActiveGame] = useState<DailyChallenge | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && activeGame) {
        showToast("Anti-Cheat: You left the game tab! Score = 0", "error");
        handleGameComplete(0, { reason: "minimized_tab" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeGame]);

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

    const currentAttempts = storage.getGameAttempts();
    await storage.setGameAttempts([attempt, ...currentAttempts]);
    
    // Update streak if not guest
    if (userId !== "guest") {
      const { updateStreak } = await import("@/lib/games/engine");
      await updateStreak(userId, currentGame.gameTypeId);
      
      const { awardXP } = await import("@/lib/games/xp");
      await awardXP(userId, currentGame.gameTypeId, score, score > 0);
    }
    
    if (userId === "guest") {
      alert(`Game complete! You scored ${score}.\n\nSign in to save your score, track your streak, and climb the leaderboard!`);
    } else {
      alert(`Game complete! You scored ${score}. Progress saved.`);
    }
    
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <div className="container" style={{ padding: "100px 20px", textAlign: "center" }}>Loading today's games...</div>;
  }

  const userId = typeof window !== 'undefined' ? localStorage.getItem("gh_session_user_id") : null;

  if (activeGame) {
    return (
      <div className="container" style={{ padding: "60px 20px", minHeight: "80vh" }}>
        {activeGame.gameTypeId === "trivia" && (
          <DailyTrivia challenge={activeGame} onComplete={handleGameComplete} />
        )}
        {activeGame.gameTypeId === "word-hunt" && (
          <WordHunt challenge={activeGame} onComplete={handleGameComplete} />
        )}
        {activeGame.gameTypeId === "match-up" && (
          <MatchUp challenge={activeGame} onComplete={handleGameComplete} />
        )}
        {activeGame.gameTypeId === "who-am-i" && (
          <WhoAmI challenge={activeGame} onComplete={handleGameComplete} />
        )}
        {activeGame.gameTypeId === "mystery" && (
          <Mystery challenge={activeGame} onComplete={handleGameComplete} />
        )}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "60px 20px", minHeight: "80vh" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "10px" }}>GamesHut Daily Games</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", marginBottom: "20px" }}>A new set of puzzles, every single day.</p>
        

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
        const totalPoints = storage.getXpTransactions().filter(tx => tx.userId === userId).reduce((sum, tx) => sum + tx.amount, 0);
        
        return (
          <div style={{ background: "var(--card-bg, #ffffff)", border: "1px solid var(--card-border, #e2e8f0)", padding: "20px", borderRadius: "16px", marginBottom: "32px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Streak</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--color-brand)" }}>{storage.getUserStreaks().find(s => s.userId === userId)?.currentStreak || 0} <span style={{fontSize:"1.2rem"}}>🔥</span></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Total Points</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981" }}>{totalPoints} <span style={{fontSize:"1.2rem"}}>✨</span></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Games Won</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#f59e0b" }}>{totalGamesWon} <span style={{fontSize:"1.2rem"}}>🏆</span></div>
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
                  const userXpMap = new Map<string, number>();
                  storage.getXpTransactions().forEach(tx => {
                    userXpMap.set(tx.userId, (userXpMap.get(tx.userId) || 0) + tx.amount);
                  });
                  const sortedUsers = Array.from(userXpMap.entries())
                    .map(([uId, totalPoints]) => ({ uId, totalPoints }))
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .slice(0, 10);
                  
                  const allPlayers = storage.getPlayers();
                  
                  return sortedUsers.map((stat, index) => {
                    const p = allPlayers.find(pl => pl.id === stat.uId);
                    if (!p) return null;
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
                              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>@{p.username}</div>
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
    </div>
  );
}
