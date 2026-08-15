"use client";

import { useState } from "react";
import { DailyChallenge } from "@/lib/storage";
import ShareResult from "./ShareResult";

type Phase = "rules" | "playing" | "done";

export default function Mystery({ challenge, onComplete }: { challenge: DailyChallenge; onComplete: (score: number, resultData: any) => void }) {
  const [phase, setPhase] = useState<Phase>("rules");
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const { scenario, question, options, answer, explanation } = challenge.content || {};

  if (!scenario || !question || !options || !answer) {
    return <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Game content not available yet.</div>;
  }

  if (phase === "rules") {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔎</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "20px" }}>Daily Mystery</h2>
          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px", marginBottom: "28px", textAlign: "left" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "14px", fontSize: "1rem" }}>How to Play</h3>
            <ul style={{ color: "var(--text-secondary)", lineHeight: 2, paddingLeft: "18px", margin: 0 }}>
              <li>Read the <strong>mystery scenario</strong> carefully</li>
              <li>Answer the deduction question using logical reasoning</li>
              <li>Pick one of 4 possible answers</li>
              <li>Score <strong style={{ color: "#10b981" }}>100 points</strong> for the correct answer</li>
              <li>You only get one shot — think before you pick!</li>
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

  const handleSelect = (option: string) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    if (option === answer) {
      setScore(100);
    }
  };

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
        <ShareResult gameType={challenge.gameTypeId} score={score} maxScore={100} challengeNumber={challenge.challengeNumber} resultData={{ correct: score > 0 }} />
        <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => onComplete(score, { correct: score > 0 })}>Save & Return to Hub</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "620px", margin: "0 auto", padding: "20px" }}>
      {/* Scenario */}
      <div style={{ background: "white", borderRadius: "16px", padding: "28px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span style={{ fontSize: "1.4rem" }}>📋</span>
          <h3 style={{ fontWeight: 700, margin: 0, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)" }}>The Scenario</h3>
        </div>
        <p style={{ lineHeight: 1.7, fontSize: "1.05rem", color: "var(--text-primary)", margin: 0 }}>{scenario}</p>
      </div>

      {/* Question */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "16px", color: "var(--text-primary)" }}>🤔 {question}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {options.map((option: string, idx: number) => {
            const isCorrect = option === answer;
            const isSelected = selected === option;
            let bg = "white";
            let border = "2px solid #e2e8f0";
            let color = "var(--text-primary)";
            if (revealed) {
              if (isCorrect) { bg = "#ecfdf5"; border = "2px solid #10b981"; color = "#059669"; }
              else if (isSelected) { bg = "#fef2f2"; border = "2px solid #ef4444"; color = "#dc2626"; }
              else { bg = "#f8fafc"; color = "#94a3b8"; }
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={revealed}
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background: bg,
                  border,
                  color,
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: "0.97rem",
                  cursor: revealed ? "default" : "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: revealed && isCorrect ? "#10b981" : revealed && isSelected ? "#ef4444" : "#f1f5f9", color: revealed && (isCorrect || isSelected) ? "white" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                  {revealed && isCorrect ? "✓" : revealed && isSelected ? "✗" : String.fromCharCode(65 + idx)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {revealed && (
        <div style={{ padding: "20px", background: score > 0 ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", borderRadius: "12px", border: `1px solid ${score > 0 ? "#10b981" : "#ef4444"}`, marginBottom: "20px" }}>
          <h4 style={{ fontWeight: 700, color: score > 0 ? "#059669" : "#dc2626", marginBottom: "8px" }}>
            {score > 0 ? "🎉 Correct! You earned 100 points!" : "❌ Not quite!"}
          </h4>
          {explanation && <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text-secondary)" }}><strong>Explanation:</strong> {explanation}</p>}
          <button
            onClick={() => setPhase("done")}
            style={{ marginTop: "16px", width: "100%", padding: "14px", borderRadius: "10px", background: "var(--color-brand)", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            Save Score & Return
          </button>
        </div>
      )}
    </div>
  );
}
