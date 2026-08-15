"use client";

import { useState } from "react";
import { DailyChallenge } from "@/lib/storage";
import ShareResult from "./ShareResult";

type Phase = "rules" | "playing" | "done";

export default function WhoAmI({ challenge, onComplete }: { challenge: DailyChallenge; onComplete: (score: number, resultData: any) => void }) {
  const [phase, setPhase] = useState<Phase>("rules");
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const entity: string = challenge.content?.entity || "";
  const clues: string[] = challenge.content?.clues || [];

  if (!clues.length || !entity) {
    return <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Game content not available yet.</div>;
  }

  const scoreMap = [100, 80, 60, 40, 20];
  const currentClues = clues.slice(0, clueIndex + 1);

  if (phase === "rules") {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🕵️</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "20px" }}>Who Am I?</h2>
          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px", marginBottom: "28px", textAlign: "left" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "14px", fontSize: "1rem" }}>How to Play</h3>
            <ul style={{ color: "var(--text-secondary)", lineHeight: 2, paddingLeft: "18px", margin: 0 }}>
              <li>You'll receive up to <strong>5 clues</strong> about a famous African person, place, or landmark</li>
              <li>Guess from the <strong>first clue</strong> to win <strong style={{ color: "#10b981" }}>100 points</strong></li>
              <li>Each extra clue you need reduces your score: 80 → 60 → 40 → 20</li>
              <li>Type your answer and hit <strong>Submit Guess</strong></li>
              <li>You can also <strong>Reveal Next Clue</strong> if you're stuck</li>
            </ul>
          </div>
          <button
            onClick={() => setPhase("playing")}
            style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "var(--color-brand)", color: "white", border: "none", fontWeight: 700, fontSize: "1.1rem", cursor: "pointer" }}
          >
            Start Game 🚀
          </button>
        </div>
      </div>
    );
  }

  const handleGuess = () => {
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = entity.toLowerCase();
    if (normalizedGuess === normalizedAnswer || normalizedAnswer.includes(normalizedGuess) && normalizedGuess.length > 3) {
      const earnedScore = scoreMap[clueIndex] ?? 10;
      setScore(earnedScore);
      setResult("correct");
    } else {
      setResult("wrong");
      setTimeout(() => setResult(null), 1000);
    }
  };

  const handleRevealClue = () => {
    if (clueIndex < clues.length - 1) {
      setClueIndex(prev => prev + 1);
      setResult(null);
    } else {
      setRevealed(true);
    }
  };

  const handleFinish = () => {
    setPhase("done");
  };

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
        <ShareResult gameType={challenge.gameTypeId} score={score} maxScore={100} challengeNumber={challenge.challengeNumber} resultData={{ cluesUsed: clueIndex + 1, entity }} />
        <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => onComplete(score, { cluesUsed: clueIndex + 1 })}>Save & Return to Hub</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Clue {clueIndex + 1} of {clues.length}</span>
        <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: "1rem" }}>
          Potential score: <strong>{scoreMap[clueIndex] ?? 10} pts</strong>
        </span>
      </div>

      {/* Clues */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {currentClues.map((clue, i) => (
          <div
            key={i}
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              background: i === clueIndex ? "rgba(99,102,241,0.06)" : "#f8fafc",
              border: i === clueIndex ? "2px solid var(--color-brand)" : "1px solid #e2e8f0",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start"
            }}
          >
            <span style={{ background: i === clueIndex ? "var(--color-brand)" : "#94a3b8", color: "white", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>{i + 1}</span>
            <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.5, color: "var(--text-primary)", fontWeight: i === clueIndex ? 600 : 400 }}>{clue}</p>
          </div>
        ))}
      </div>

      {/* Reveal box */}
      {revealed && (
        <div style={{ padding: "16px", background: "#fef3c7", borderRadius: "12px", marginBottom: "20px", textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#92400e" }}>The answer was: <span style={{ fontSize: "1.2rem" }}>{entity}</span></p>
        </div>
      )}

      {result === "correct" ? (
        <div style={{ padding: "24px", background: "#ecfdf5", border: "2px solid #10b981", borderRadius: "16px", textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🎉</div>
          <h3 style={{ color: "#059669", fontWeight: 800, marginBottom: "4px" }}>Correct! It's {entity}</h3>
          <p style={{ color: "#065f46" }}>You earned <strong>{score} points</strong> using {clueIndex + 1} clue{clueIndex !== 0 ? "s" : ""}!</p>
          <button onClick={handleFinish} style={{ marginTop: "16px", padding: "12px 32px", borderRadius: "10px", background: "#10b981", color: "white", border: "none", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
            Save Score
          </button>
        </div>
      ) : (
        <>
          {!revealed && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <input
                type="text"
                value={guess}
                onChange={e => setGuess(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGuess()}
                placeholder="Type your guess..."
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: result === "wrong" ? "2px solid #ef4444" : "2px solid #e2e8f0",
                  fontSize: "1rem",
                  outline: "none",
                  background: result === "wrong" ? "rgba(239,68,68,0.05)" : "white"
                }}
              />
              <button
                onClick={handleGuess}
                disabled={!guess.trim()}
                style={{ padding: "14px 20px", borderRadius: "10px", background: "var(--color-brand)", color: "white", border: "none", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Submit ✓
              </button>
            </div>
          )}
          {result === "wrong" && <p style={{ color: "#ef4444", fontWeight: 600, textAlign: "center", marginBottom: "12px" }}>Not quite — try again or reveal the next clue</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            {!revealed && clueIndex < clues.length - 1 && (
              <button
                onClick={handleRevealClue}
                style={{ flex: 1, padding: "14px", borderRadius: "10px", background: "#f8fafc", border: "2px solid #e2e8f0", fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)" }}
              >
                Reveal Next Clue 🔍
              </button>
            )}
            {(revealed || clueIndex === clues.length - 1) && !revealed && (
              <button
                onClick={() => { setRevealed(true); setScore(0); }}
                style={{ flex: 1, padding: "14px", borderRadius: "10px", background: "#fef3c7", border: "2px solid #f59e0b", fontWeight: 600, cursor: "pointer", color: "#92400e" }}
              >
                Give Up & Reveal Answer
              </button>
            )}
            {revealed && (
              <button onClick={handleFinish} style={{ flex: 1, padding: "14px", borderRadius: "10px", background: "#e2e8f0", border: "none", fontWeight: 600, cursor: "pointer" }}>
                Finish Game
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
