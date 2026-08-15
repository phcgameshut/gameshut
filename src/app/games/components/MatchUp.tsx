"use client";

import { useState, useEffect } from "react";
import { DailyChallenge } from "@/lib/storage";
import ShareResult from "./ShareResult";
import GameRules from "./GameRules";

interface Pair { left: string; right: string; }

type Phase = "rules" | "playing" | "done";

export default function MatchUp({ challenge, onComplete }: { challenge: DailyChallenge; onComplete: (score: number, resultData: any) => void }) {
  const [phase, setPhase] = useState<Phase>("rules");
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [failedLefts, setFailedLefts] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<{ l: number; r: number } | null>(null);
  const [score, setScore] = useState(0);
  const [rightOrder, setRightOrder] = useState<number[]>([]);

  const pairs: Pair[] = challenge.content?.pairs || [];
  const theme: string = challenge.content?.theme || "";

  useEffect(() => {
    if (pairs.length > 0) {
      const shuffled = [...Array(pairs.length).keys()].sort(() => Math.random() - 0.5);
      setRightOrder(shuffled);
    }
  }, [pairs.length]);

  if (!pairs.length) {
    return <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Game content not available yet. Please check back later.</div>;
  }

  if (phase === "rules") {
    return (
      <GameRules 
        title="Match Up"
        theme={theme}
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>}
        instructions={[
          "You'll see two columns: Left and Right",
          "Click one item from the left column",
          "Then click its matching pair from the right column",
          <span key="colors">Correct matches turn <strong style={{ color: "var(--accent-primary)" }}>green</strong>, wrong flashes <strong style={{ color: "#ef4444" }}>red</strong></span>,
          `Match all ${pairs.length} pairs to win!`
        ]}
        onStart={() => setPhase("playing")}
      />
    );
  }

  const handleLeftClick = (idx: number) => {
    if (matchedPairs.includes(idx) || failedLefts.includes(idx)) return;
    setSelectedLeft(selectedLeft === idx ? null : idx);
    setWrongPair(null);
  };

  const handleRightClick = (shuffledIdx: number) => {
    const originalIdx = rightOrder[shuffledIdx];
    if (matchedPairs.includes(originalIdx)) return;
    if (selectedLeft === null) return;

    if (selectedLeft === originalIdx) {
      const newMatched = [...matchedPairs, originalIdx];
      setMatchedPairs(newMatched);
      setScore(prev => prev + 20);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newMatched.length + failedLefts.length === pairs.length) {
        setTimeout(() => setPhase("done"), 600);
      }
    } else {
      setWrongPair({ l: selectedLeft, r: shuffledIdx });
      const newFailed = [...failedLefts, selectedLeft];
      setFailedLefts(newFailed);
      
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
        if (matchedPairs.length + newFailed.length === pairs.length) {
          setPhase("done");
        }
      }, 800);
    }
  };

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
        <ShareResult gameType={challenge.gameTypeId} score={score} maxScore={pairs.length * 20} challengeNumber={challenge.challengeNumber} resultData={{ matchedPairs: pairs.length }} />
        <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => onComplete(score, { matchedPairs: pairs.length })}>Save & Play Another</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{matchedPairs.length}/{pairs.length} matched</span>
        <span style={{ fontWeight: 700, color: "var(--color-brand)", fontSize: "1.1rem" }}>Score: {score}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", marginBottom: "24px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(matchedPairs.length / pairs.length) * 100}%`, background: "var(--color-brand)", borderRadius: "3px", transition: "width 0.4s ease" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", marginBottom: "4px" }}>Column A</div>
          {pairs.map((pair, idx) => {
            const isMatched = matchedPairs.includes(idx);
            const isFailed = failedLefts.includes(idx);
            const isSelected = selectedLeft === idx;
            const isWrong = wrongPair?.l === idx;
            return (
              <button
                key={idx}
                onClick={() => handleLeftClick(idx)}
                disabled={isMatched || isFailed}
                style={{
                  padding: "14px 12px",
                  borderRadius: "10px",
                  border: isMatched ? "2px solid #10b981" : isWrong ? "2px solid #ef4444" : isFailed ? "2px dashed #ef4444" : isSelected ? "2px solid var(--color-brand)" : "2px solid #e2e8f0",
                  background: isMatched ? "#ecfdf5" : isWrong ? "rgba(239,68,68,0.08)" : isFailed ? "rgba(239,68,68,0.04)" : isSelected ? "rgba(99,102,241,0.08)" : "white",
                  color: isMatched ? "#059669" : isFailed || isWrong ? "#ef4444" : "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: isMatched || isFailed ? "default" : "pointer",
                  transition: "all 0.2s",
                  textAlign: "center",
                  textDecoration: isFailed && !isWrong ? "line-through" : "none",
                  boxShadow: isSelected ? "0 0 0 3px rgba(99,102,241,0.15)" : "0 2px 4px rgba(0,0,0,0.04)"
                }}
              >
                {isMatched ? "✓ " : isFailed && !isWrong ? "✗ " : ""}{pair.left}
              </button>
            );
          })}
        </div>

        {/* Right column (shuffled) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", marginBottom: "4px" }}>Column B</div>
          {rightOrder.map((originalIdx, shuffledIdx) => {
            const pair = pairs[originalIdx];
            const isMatched = matchedPairs.includes(originalIdx);
            const isWrong = wrongPair?.r === shuffledIdx;
            return (
              <button
                key={shuffledIdx}
                onClick={() => handleRightClick(shuffledIdx)}
                disabled={isMatched || selectedLeft === null}
                style={{
                  padding: "14px 12px",
                  borderRadius: "10px",
                  border: isWrong ? "2px solid #ef4444" : "2px solid #e2e8f0",
                  background: isMatched ? "#ecfdf5" : isWrong ? "rgba(239,68,68,0.08)" : selectedLeft !== null && !isMatched ? "rgba(99,102,241,0.04)" : "white",
                  color: isMatched ? "#059669" : "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: isMatched || selectedLeft === null ? "default" : "pointer",
                  transition: "all 0.2s",
                  textAlign: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  opacity: selectedLeft === null && !isMatched ? 0.7 : 1
                }}
              >
                {isMatched ? "✓ " : ""}{pair.right}
              </button>
            );
          })}
        </div>
      </div>

      {selectedLeft !== null && (
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "0.9rem", color: "var(--color-brand)", fontWeight: 600 }}>
          "{pairs[selectedLeft].left}" selected — now click its match on the right →
        </p>
      )}
    </div>
  );
}
