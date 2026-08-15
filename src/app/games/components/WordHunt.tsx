"use client";

import { useState, useCallback } from "react";
import { DailyChallenge } from "@/lib/storage";
import ShareResult from "./ShareResult";

type Phase = "rules" | "playing" | "done";

interface Cell { letter: string; selected: boolean; found: boolean; }

export default function WordHunt({ challenge, onComplete }: { challenge: DailyChallenge; onComplete: (score: number, resultData: any) => void }) {
  const grid: string[] = challenge.content?.grid || [];
  const wordsToFind: string[] = (challenge.content?.wordsToFind || []).map((w: string) => w.toUpperCase());
  const theme: string = challenge.content?.theme || "";

  const [phase, setPhase] = useState<Phase>("rules");
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [cells, setCells] = useState<Cell[]>(() =>
    grid.map(letter => ({ letter: letter.toUpperCase(), selected: false, found: false }))
  );
  const [wrongFlash, setWrongFlash] = useState(false);
  const [score, setScore] = useState(0);

  const GRID_SIZE = Math.round(Math.sqrt(grid.length)) || 4;

  if (!grid.length || !wordsToFind.length) {
    return <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Game content not available yet.</div>;
  }

  if (phase === "rules") {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔤</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Word Hunt</h2>
          {theme && <p style={{ color: "var(--color-brand)", fontWeight: 700, marginBottom: "20px", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "1px" }}>Theme: {theme}</p>}
          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "24px", marginBottom: "28px", textAlign: "left" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "14px", fontSize: "1rem" }}>How to Play</h3>
            <ul style={{ color: "var(--text-secondary)", lineHeight: 2, paddingLeft: "18px", margin: 0 }}>
              <li>A {GRID_SIZE}×{GRID_SIZE} grid of letters will appear</li>
              <li>Click letters <strong>in sequence</strong> to spell the hidden words</li>
              <li>Words may run in <strong>any direction</strong></li>
              <li>Find all <strong>{wordsToFind.length} hidden words</strong> to complete the game</li>
              <li>Each word earns you <strong style={{ color: "#10b981" }}>10 points</strong></li>
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

  const handleCellClick = (idx: number) => {
    if (cells[idx].found) return;

    const newSelected = cells[idx].selected
      ? selectedCells.filter(i => i !== idx)
      : [...selectedCells, idx];

    setCells(prev => prev.map((c, i) => ({ ...c, selected: newSelected.includes(i) })));
    setSelectedCells(newSelected);

    // Build selected word
    const selectedWord = newSelected.map(i => cells[i].letter).join("");

    // Check if it matches any target word
    const matched = wordsToFind.find(w => !foundWords.includes(w) && w === selectedWord);
    if (matched) {
      const newFound = [...foundWords, matched];
      setFoundWords(newFound);
      setScore(prev => prev + 10);
      setCells(prev => prev.map((c, i) => newSelected.includes(i) ? { ...c, found: true, selected: false } : c));
      setSelectedCells([]);
      if (newFound.length === wordsToFind.length) {
        setTimeout(() => setPhase("done"), 500);
      }
    }
  };

  const clearSelection = () => {
    setCells(prev => prev.map(c => ({ ...c, selected: false })));
    setSelectedCells([]);
  };

  const checkWord = () => {
    const selectedWord = selectedCells.map(i => cells[i].letter).join("");
    const matched = wordsToFind.find(w => !foundWords.includes(w) && w === selectedWord);
    if (matched) {
      const newFound = [...foundWords, matched];
      setFoundWords(newFound);
      setScore(prev => prev + 10);
      setCells(prev => prev.map((c, i) => selectedCells.includes(i) ? { ...c, found: true, selected: false } : c));
      setSelectedCells([]);
      if (newFound.length === wordsToFind.length) {
        setTimeout(() => setPhase("done"), 500);
      }
    } else {
      setWrongFlash(true);
      setTimeout(() => {
        setWrongFlash(false);
        clearSelection();
      }, 700);
    }
  };

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
        <ShareResult gameType={challenge.gameTypeId} score={score} maxScore={wordsToFind.length * 10} challengeNumber={challenge.challengeNumber} resultData={{ foundWords }} />
        <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => onComplete(score, { foundWords })}>Save & Return to Hub</button>
      </div>
    );
  }

  const currentWord = selectedCells.map(i => cells[i].letter).join("");

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{foundWords.length}/{wordsToFind.length} words found</span>
        <span style={{ fontWeight: 700, color: "var(--color-brand)" }}>Score: {score}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", marginBottom: "24px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(foundWords.length / wordsToFind.length) * 100}%`, background: "#10b981", borderRadius: "3px", transition: "width 0.4s" }} />
      </div>

      {/* Words to find */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px", justifyContent: "center" }}>
        {wordsToFind.map(word => (
          <span key={word} style={{
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: 700,
            background: foundWords.includes(word) ? "#ecfdf5" : "#f1f5f9",
            color: foundWords.includes(word) ? "#059669" : "var(--text-secondary)",
            textDecoration: foundWords.includes(word) ? "line-through" : "none",
            border: `1px solid ${foundWords.includes(word) ? "#10b981" : "#e2e8f0"}`
          }}>
            {word}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gap: "6px",
        marginBottom: "20px",
        background: wrongFlash ? "rgba(239,68,68,0.05)" : "transparent",
        borderRadius: "12px",
        padding: "8px",
        transition: "background 0.2s"
      }}>
        {cells.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            style={{
              aspectRatio: "1",
              borderRadius: "10px",
              border: "none",
              background: cell.found
                ? "#10b981"
                : cell.selected
                  ? wrongFlash ? "#ef4444" : "var(--color-brand)"
                  : "#f1f5f9",
              color: cell.found || cell.selected ? "white" : "var(--text-primary)",
              fontWeight: 800,
              fontSize: "clamp(1rem, 3vw, 1.3rem)",
              cursor: cell.found ? "default" : "pointer",
              transition: "all 0.15s ease",
              transform: cell.selected && !wrongFlash ? "scale(1.08)" : "scale(1)",
              boxShadow: cell.selected ? "0 4px 12px rgba(99,102,241,0.3)" : "none"
            }}
          >
            {cell.letter}
          </button>
        ))}
      </div>

      {/* Current word + actions */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", background: "#f8fafc", border: "2px solid #e2e8f0", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "4px", textAlign: "center", minHeight: "48px", color: currentWord ? "var(--text-primary)" : "#94a3b8" }}>
          {currentWord || "Click letters..."}
        </div>
        {selectedCells.length > 0 && (
          <>
            <button
              onClick={checkWord}
              style={{ padding: "12px 16px", borderRadius: "10px", background: "var(--color-brand)", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}
            >
              ✓
            </button>
            <button
              onClick={clearSelection}
              style={{ padding: "12px 16px", borderRadius: "10px", background: "#f1f5f9", border: "2px solid #e2e8f0", fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)" }}
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
}
