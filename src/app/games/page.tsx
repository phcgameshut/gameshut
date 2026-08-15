"use client";

import { useEffect, useState } from "react";
import { DailyChallenge, storage, GameAttempt } from "@/lib/storage";
import DailyTrivia from "./components/DailyTrivia";
import WordHunt from "./components/WordHunt";
import MatchUp from "./components/MatchUp";
import WhoAmI from "./components/WhoAmI";
import Mystery from "./components/Mystery";
import Link from "next/link";

export default function GamesHub() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const [activeGame, setActiveGame] = useState<DailyChallenge | null>(null);

  const handleGameComplete = async (score: number, resultData: any) => {
    if (!activeGame) return;
    
    const userId = localStorage.getItem("gh_session_user_id") || "guest";
    const attempt: GameAttempt = {
      id: "att_" + Math.random().toString(36).substr(2, 9),
      userId,
      challengeId: activeGame.id,
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
      await updateStreak(userId, activeGame.gameTypeId);
      
      const { awardXP } = await import("@/lib/games/xp");
      await awardXP(userId, activeGame.gameTypeId, score, score > 0);
    }
    
    setActiveGame(null);
    
    if (userId === "guest") {
      alert(`Game complete! You scored ${score}.\n\nSign in to save your score, track your streak, and climb the leaderboard!`);
    } else {
      alert(`Game complete! You scored ${score}. Progress saved.`);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: "100px 20px", textAlign: "center" }}>Loading today's games...</div>;
  }

  const userId = typeof window !== 'undefined' ? localStorage.getItem("gh_session_user_id") : null;

  if (activeGame) {
    return (
      <div className="container" style={{ padding: "60px 20px", minHeight: "80vh" }}>
        <button 
          onClick={() => setActiveGame(null)}
          style={{ marginBottom: "20px", background: "none", border: "none", color: "var(--color-brand)", cursor: "pointer", fontWeight: 600 }}
        >
          ← Back to Hub
        </button>
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
        
        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", padding: "16px 20px", borderRadius: "12px", display: "inline-block", textAlign: "left" }}>
          <h3 style={{ color: "#047857", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 8px 0" }}>🎁 Earn While You Play!</h3>
          <p style={{ color: "#065f46", margin: 0, fontSize: "0.95rem", lineHeight: "1.5" }}>
            Get <strong>10 Voucher Points</strong> every time you complete a game. <br/>
            <strong>5,000 Points = ₦5,000</strong>. You can redeem your points for Event Passes or Board Games in the Shop!<br/>
            <Link href="/login" style={{ color: "#047857", textDecoration: "underline", fontWeight: 700 }}>Create an account</Link> or sign in to start earning.
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
        const totalXP = storage.getXpTransactions().filter(tx => tx.userId === userId).reduce((sum, tx) => sum + tx.amount, 0);
        
        return (
          <div style={{ background: "var(--card-bg, #ffffff)", border: "1px solid var(--card-border, #e2e8f0)", padding: "20px", borderRadius: "16px", marginBottom: "32px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Global Streak</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--color-brand)" }}>{storage.getUserStreaks().find(s => s.userId === userId)?.currentStreak || 0} <span style={{fontSize:"1.2rem"}}>🔥</span></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Total XP</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#10b981" }}>{totalXP} <span style={{fontSize:"1.2rem"}}>✨</span></div>
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
                  {game ? "Available to play!" : "Coming soon or generating..."}
                </p>
              </div>
              <button 
                onClick={() => game && setActiveGame(game)}
                disabled={!game}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  background: game ? "var(--color-brand)" : "var(--bg-secondary)",
                  color: game ? "white" : "var(--text-tertiary)",
                  border: "none",
                  fontWeight: 600,
                  cursor: game ? "pointer" : "not-allowed"
                }}
              >
                {game ? "Play Now" : "Not Available"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}
