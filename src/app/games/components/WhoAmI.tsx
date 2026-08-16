"use client";

import { useState } from "react";
import { DailyChallenge } from "@/lib/storage";
import { getLevenshteinDistance } from "@/lib/stringUtils";
import ShareResult from "./ShareResult";
import GameRules from "./GameRules";

type Phase = "rules" | "playing";

export default function WhoAmI({ challenge, onComplete, onCancel }: { challenge: DailyChallenge; onComplete: (score: number, resultData: any) => void; onCancel?: () => void }) {
  const [phase, setPhase] = useState<Phase>("rules");
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"correct" | "partial" | "wrong" | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
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
      <GameRules 
        title="Who Am I?"
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>}
        instructions={[
          "You'll receive up to 5 clues about a famous Nigerian person, place, or landmark",
          <span key="points1">Guess from the <strong>first clue</strong> to win <strong style={{ color: "var(--accent-primary)" }}>100 points</strong></span>,
          "Each extra clue you need reduces your score: 80 → 60 → 40 → 20",
          "Type your answer and hit Submit Guess",
          "You can also Reveal Next Clue if you're stuck"
        ]}
        onStart={() => setPhase("playing")}
        onCancel={onCancel}
      />
    );
  }

  const handleGuess = () => {
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = entity.toLowerCase();
    const baseScore = scoreMap[clueIndex] ?? 10;
    
    if (normalizedGuess === "") return;

    // 1. Exact Full Match
    if (normalizedGuess === normalizedAnswer) {
      setScore(baseScore);
      setFeedbackMessage("Perfect match!");
      setResult("correct");
      return;
    }

    // 2. Minor Misspelling (Distance <= 2)
    const distance = getLevenshteinDistance(normalizedGuess, normalizedAnswer);
    if (distance <= 2 && normalizedAnswer.length > 4) {
      setScore(Math.floor(baseScore * 0.8));
      setFeedbackMessage("Minor typo detected. 80% points awarded.");
      setResult("partial");
      return;
    }

    // 3. Partial Name Match (First or Last name exactly)
    const answerParts = normalizedAnswer.split(" ").filter(p => p.length > 2);
    if (answerParts.length > 1 && answerParts.includes(normalizedGuess)) {
      setScore(Math.floor(baseScore * 0.5));
      setFeedbackMessage(`You got part of the name ("${guess.trim()}"). Half points awarded.`);
      setResult("partial");
      return;
    }

    // 4. Wrong Answer
    setResult("wrong");
    setTimeout(() => setResult(null), 1000);
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
    onComplete(score, { cluesUsed: clueIndex + 1 });
  };

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

      {result === "correct" || result === "partial" ? (
        <div style={{ padding: "24px", background: "#ecfdf5", border: "2px solid #10b981", borderRadius: "16px", textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🎉</div>
          <h3 style={{ color: "#059669", fontWeight: 800, marginBottom: "4px" }}>It's {entity}!</h3>
          <p style={{ color: "#047857", fontWeight: 700, fontSize: "1.05rem", marginBottom: "8px" }}>{feedbackMessage}</p>
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
