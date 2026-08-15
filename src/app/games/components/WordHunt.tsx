"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { DailyChallenge } from "@/lib/storage";
import ShareResult from "./ShareResult";

type Phase = "rules" | "playing" | "done";

interface Cell { letter: string; row: number; col: number; }
interface FoundWord { word: string; cells: string[]; color: string; }

const WORD_COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
const GRID_SIZE = 10;
const DIRECTIONS = [
  [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]
];
const ALPHABET = "ABCDEFGHIJKLMNOPRSTUVWYZ";

function buildGrid(words: string[]): { grid: string[][], placements: Record<string, string[]> } {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
  const placements: Record<string, string[]> = {};

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const [dr, dc] = dir;
      const maxRow = dr > 0 ? GRID_SIZE - word.length : dr < 0 ? word.length - 1 : GRID_SIZE - 1;
      const minRow = dr < 0 ? word.length - 1 : 0;
      const maxCol = dc > 0 ? GRID_SIZE - word.length : dc < 0 ? word.length - 1 : GRID_SIZE - 1;
      const minCol = dc < 0 ? word.length - 1 : 0;
      if (maxRow < minRow || maxCol < minCol) continue;
      const startRow = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
      const startCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));
      // Check fit
      let canPlace = true;
      const cells: string[] = [];
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        if (grid[r][c] !== "" && grid[r][c] !== word[i]) { canPlace = false; break; }
        cells.push(`${r}-${c}`);
      }
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          grid[startRow + dr * i][startCol + dc * i] = word[i];
        }
        placements[word] = cells;
        placed = true;
      }
    }
  }

  // Fill empty cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }

  return { grid, placements };
}

export default function WordHunt({ challenge, onComplete }: { challenge: DailyChallenge; onComplete: (score: number, resultData: any) => void }) {
  const wordsToFind: string[] = (challenge.content?.wordsToFind || []).map((w: string) => w.toUpperCase().trim());
  const theme: string = challenge.content?.theme || "";

  const [phase, setPhase] = useState<Phase>("rules");
  const [grid, setGrid] = useState<string[][]>([]);
  const [placements, setPlacements] = useState<Record<string, string[]>>({});
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [selecting, setSelecting] = useState<string[]>([]);
  const [dragStart, setDragStart] = useState<{r:number,c:number}|null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [score, setScore] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wordsToFind.length > 0 && grid.length === 0) {
      const { grid: g, placements: p } = buildGrid(wordsToFind);
      setGrid(g);
      setPlacements(p);
    }
  }, [wordsToFind.length]);

  if (!wordsToFind.length) {
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
            <h3 style={{ fontWeight: 700, marginBottom: "14px" }}>How to Play</h3>
            <ul style={{ color: "var(--text-secondary)", lineHeight: 2.2, paddingLeft: "18px", margin: 0 }}>
              <li>Find all <strong>{wordsToFind.length} hidden words</strong> in the letter grid</li>
              <li>Words run <strong>horizontally, vertically, or diagonally</strong> — in any direction</li>
              <li><strong>Tap and drag</strong> across letters to select a word</li>
              <li>Each found word earns you <strong style={{ color: "#10b981" }}>20 points</strong></li>
              <li>The word list is shown at the bottom — find them all!</li>
            </ul>
          </div>
          <button onClick={() => setPhase("playing")} style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "var(--color-brand)", color: "white", border: "none", fontWeight: 700, fontSize: "1.1rem", cursor: "pointer" }}>
            Start Game 🚀
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
        <ShareResult gameType={challenge.gameTypeId} score={score} maxScore={wordsToFind.length * 20} challengeNumber={challenge.challengeNumber} resultData={{ foundWords: foundWords.map(f => f.word) }} />
        <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => onComplete(score, { foundWords: foundWords.map(f => f.word) })}>Save & Return to Hub</button>
      </div>
    );
  }

  const getCellKey = (r: number, c: number) => `${r}-${c}`;

  const getLineCells = (start: {r:number,c:number}, end: {r:number,c:number}): string[] => {
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    if (len === 0) return [getCellKey(start.r, start.c)];
    const sr = dr === 0 ? 0 : dr / Math.abs(dr);
    const sc = dc === 0 ? 0 : dc / Math.abs(dc);
    // Only allow straight lines
    if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0 && Math.abs(dr) !== Math.abs(dc)) return [getCellKey(start.r, start.c)];
    const cells: string[] = [];
    for (let i = 0; i <= len; i++) cells.push(getCellKey(start.r + sr * i, start.c + sc * i));
    return cells;
  };

  const checkSelection = (cells: string[]) => {
    const word = cells.map(k => { const [r,c] = k.split("-").map(Number); return grid[r]?.[c] || ""; }).join("");
    const wordRev = word.split("").reverse().join("");

    const match = wordsToFind.find(w => !foundWords.find(f => f.word === w) && (w === word || w === wordRev));
    if (match) {
      const colorIdx = foundWords.length % WORD_COLORS.length;
      const newFound = [...foundWords, { word: match, cells, color: WORD_COLORS[colorIdx] }];
      setFoundWords(newFound);
      setScore(prev => prev + 20);
      if (newFound.length === wordsToFind.length) setTimeout(() => setPhase("done"), 700);
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 500);
    }
    setSelecting([]);
    setDragStart(null);
  };

  const handleMouseDown = (r: number, c: number) => {
    setDragStart({ r, c });
    setSelecting([getCellKey(r, c)]);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!dragStart) return;
    const cells = getLineCells(dragStart, { r, c });
    setSelecting(cells);
  };

  const handleMouseUp = () => {
    if (selecting.length > 1) checkSelection(selecting);
    else { setSelecting([]); setDragStart(null); }
  };

  // Touch support — elementFromPoint finds which cell is under the finger
  const getCellCoords = (el: Element | null): { r: number; c: number } | null => {
    if (!el) return null;
    // Walk up the DOM to find an element with data-cellkey
    const cell = (el as HTMLElement).closest ? (el as HTMLElement).closest('[data-cellkey]') : el;
    if (!cell) return null;
    const key = (cell as HTMLElement).dataset.cellkey;
    if (!key) return null;
    const [r, c] = key.split("-").map(Number);
    return { r, c };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const coords = getCellCoords(el);
    if (coords) {
      setDragStart(coords);
      setSelecting([getCellKey(coords.r, coords.c)]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!dragStart) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const coords = getCellCoords(el);
    if (coords) {
      const cells = getLineCells(dragStart, coords);
      setSelecting(cells);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (selecting.length > 1) checkSelection(selecting);
    else { setSelecting([]); setDragStart(null); }
  };

  const foundCellMap: Record<string, string> = {};
  foundWords.forEach(fw => fw.cells.forEach(ck => { foundCellMap[ck] = fw.color; }));

  const foundWordSet = new Set(foundWords.map(f => f.word));

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px", userSelect: "none" }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.9rem" }}>{foundWords.length}/{wordsToFind.length} words found</span>
        <span style={{ fontWeight: 700, color: "var(--color-brand)" }}>Score: {score}</span>
      </div>
      <div style={{ height: "5px", background: "#e2e8f0", borderRadius: "3px", marginBottom: "20px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(foundWords.length / wordsToFind.length) * 100}%`, background: "var(--color-brand)", borderRadius: "3px", transition: "width 0.4s" }} />
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        onMouseLeave={() => { if (dragStart) { checkSelection(selecting); } }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: "3px", background: "#e2e8f0", borderRadius: "12px", padding: "8px", touchAction: "none", WebkitUserSelect: "none" }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = getCellKey(r, c);
            const isSelecting = selecting.includes(key);
            const foundColor = foundCellMap[key];
            const isWrong = isSelecting && wrongFlash;

            let bg = "white";
            let color = "#334155";
            let fontWeight = 600;

            if (foundColor) { bg = foundColor; color = "white"; fontWeight = 800; }
            else if (isWrong) { bg = "#fecaca"; color = "#dc2626"; }
            else if (isSelecting) { bg = "#ddd6fe"; color = "#6d28d9"; }

            return (
              <div
                key={key}
                data-cellkey={key}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
                onMouseUp={handleMouseUp}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  background: bg,
                  color,
                  fontWeight,
                  fontSize: "clamp(0.65rem, 2vw, 0.9rem)",
                  cursor: "default",
                  transition: "background 0.1s, color 0.1s",
                  boxShadow: isSelecting && !wrongFlash ? "inset 0 0 0 2px #7c3aed" : "none",
                  letterSpacing: "0"
                }}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Word list — subtle, below grid */}
      <div style={{ marginTop: "20px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Words to find</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {wordsToFind.map((word, i) => {
            const found = foundWordSet.has(word);
            const foundObj = foundWords.find(f => f.word === word);
            return (
              <span key={i} style={{
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 700,
                background: found ? foundObj!.color : "white",
                color: found ? "white" : "#64748b",
                border: `1px solid ${found ? foundObj!.color : "#e2e8f0"}`,
                textDecoration: found ? "line-through" : "none",
                opacity: found ? 0.8 : 1,
                transition: "all 0.3s",
                letterSpacing: "0.5px"
              }}>
                {found ? "✓ " : ""}{word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
