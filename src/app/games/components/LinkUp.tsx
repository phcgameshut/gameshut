"use client";

import { useState, useEffect } from "react";
import GameRules from "./GameRules";

type Phase = "rules" | "playing";

export interface CategoryGroup {
  category: string;
  items: string[];
  color: "yellow" | "green" | "blue" | "purple";
  description?: string;
}

interface LinkUpProps {
  challenge?: {
    content?: {
      categories?: CategoryGroup[];
      theme?: string;
    };
    challengeNumber?: number;
  };
  onComplete?: (score: number, resultData: any) => void;
  onCancel?: () => void;
  onNextPuzzle?: () => void;
  hasNextPuzzle?: boolean;
}

const CATEGORY_COLORS = {
  yellow: { bg: "#fef08a", border: "#facc15", text: "#854d0e", badge: "Straightforward" },
  green: { bg: "#bbf7d0", border: "#4ade80", text: "#166534", badge: "Culture & Heritage" },
  blue: { bg: "#bfdbfe", border: "#60a5fa", text: "#1e40af", badge: "Fact Association" },
  purple: { bg: "#e9d5ff", border: "#c084fc", text: "#6b21a8", badge: "Clever Deduction" }
};

export default function LinkUp({
  challenge,
  onComplete,
  onCancel,
  onNextPuzzle,
  hasNextPuzzle = false
}: LinkUpProps) {
  const [phase, setPhase] = useState<Phase>("rules");

  const categories: CategoryGroup[] = challenge?.content?.categories || [
    {
      category: "Classic Nigerian Soups",
      items: ["EGUSI", "OGBONO", "OFE ONUGBU", "AFANG"],
      color: "yellow"
    },
    {
      category: "Traditional Musical Instruments",
      items: ["OGENE", "TALKING DRUM", "KAKAKI", "SHEKERE"],
      color: "green"
    },
    {
      category: "Nigerian States Named After Rivers",
      items: ["NIGER", "BENUE", "KADUNA", "OGUN"],
      color: "blue"
    },
    {
      category: "Things Found in a Monopoly Box",
      items: ["CHANCE CARDS", "HOTEL TOKENS", "TOP HAT PAWN", "PLAY MONEY"],
      color: "purple"
    }
  ];

  const theme = challenge?.content?.theme || "Heritage, Culture & Trivia";

  // State
  const [solvedCategories, setSolvedCategories] = useState<CategoryGroup[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [mistakesRemaining, setMistakesRemaining] = useState(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Initialize remaining words with shuffle whenever challenge changes
  useEffect(() => {
    const allWords = categories.flatMap(c => c.items.map(w => w.toUpperCase()));
    setRemainingWords([...allWords].sort(() => Math.random() - 0.5));
    setSolvedCategories([]);
    setSelectedWords([]);
    setMistakesRemaining(4);
    setIsGameOver(false);
    setHasWon(false);
    setPhase("rules");
  }, [challenge]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleTileClick = (word: string) => {
    if (isGameOver) return;
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      if (selectedWords.length < 4) {
        setSelectedWords([...selectedWords, word]);
      }
    }
  };

  const handleShuffle = () => {
    setRemainingWords(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleDeselectAll = () => {
    setSelectedWords([]);
  };

  const calculateScore = (solvedCount: number) => {
    return solvedCount * 25; // 25 points per correct group (up to 100)
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 4 || isGameOver) return;

    // Check if selectedWords match any unsolved category
    let matchedCategory: CategoryGroup | null = null;
    let isOneAway = false;

    for (const cat of categories) {
      if (solvedCategories.some(sc => sc.category === cat.category)) continue;

      const catItems = cat.items.map(i => i.toUpperCase());
      const intersection = selectedWords.filter(w => catItems.includes(w));

      if (intersection.length === 4) {
        matchedCategory = cat;
        break;
      } else if (intersection.length === 3) {
        isOneAway = true;
      }
    }

    if (matchedCategory) {
      // Correct!
      const newSolved = [...solvedCategories, matchedCategory];
      const matchedWords = matchedCategory.items.map(i => i.toUpperCase());
      setSolvedCategories(newSolved);
      setRemainingWords(prev => prev.filter(w => !matchedWords.includes(w)));
      setSelectedWords([]);

      if (newSolved.length === categories.length) {
        // All 4 solved!
        setIsGameOver(true);
        setHasWon(true);
        const finalScore = calculateScore(4);
        showToast("Brilliant! All 4 groups solved! (+100 pts) 🏆");
        if (onComplete) {
          setTimeout(() => onComplete(finalScore, { mistakesRemaining, solvedCount: 4 }), 1800);
        }
      } else {
        showToast(`Group solved! +25 pts (${newSolved.length * 25}/100) 🎯`);
      }
    } else {
      // Wrong
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);

      const nextMistakes = mistakesRemaining - 1;
      setMistakesRemaining(nextMistakes);

      if (isOneAway) {
        showToast("One away... 🤏 (3 of 4 are correct!)");
      } else {
        showToast("Not quite! Try another 4 words.");
      }

      if (nextMistakes <= 0) {
        // Out of mistakes
        setIsGameOver(true);
        setHasWon(false);
        const finalScore = calculateScore(solvedCategories.length);
        // Reveal remaining categories
        setSolvedCategories(categories);
        setRemainingWords([]);
        setSelectedWords([]);
        showToast(`Round over! You banked ${finalScore} points (25 pts per group). Revealing answers for 8s...`);
        if (onComplete) {
          setTimeout(() => onComplete(finalScore, { mistakesRemaining: 0, solvedCount: solvedCategories.length, failed: true }), 8000);
        }
      }
    }
  };

  const handleRestart = () => {
    const allWords = categories.flatMap(c => c.items.map(w => w.toUpperCase()));
    setRemainingWords([...allWords].sort(() => Math.random() - 0.5));
    setSolvedCategories([]);
    setSelectedWords([]);
    setMistakesRemaining(4);
    setIsGameOver(false);
    setHasWon(false);
    setPhase("playing");
  };

  if (phase === "rules") {
    return (
      <GameRules
        title="LinkUp"
        theme={theme}
        icon={
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
          </svg>
        }
        instructions={[
          "Find 4 groups of 4 words or phrases that share a common link",
          "Tap 4 items to select them, then tap Submit",
          <span key="points">Earn <strong style={{ color: "#10b981" }}>+25 points</strong> for every correct group you solve (up to 100 points total)</span>,
          "You have 4 mistakes allowed before the round ends",
          "Even if you don't solve all four, you keep whatever points you banked!",
          <span key="diff">Categories are color-coded: <strong style={{ color: "#ca8a04" }}>Yellow</strong> (easiest) to <strong style={{ color: "#7e22ce" }}>Purple</strong> (clever deduction)</span>
        ]}
        onStart={() => setPhase("playing")}
        onCancel={onCancel}
        ctaText="Start LinkUp"
      />
    );
  }

  const currentScore = calculateScore(hasWon ? 4 : (isGameOver ? solvedCategories.length : solvedCategories.length));

  return (
    <div style={{
      maxWidth: "560px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      userSelect: "none",
      padding: "10px",
      width: "100%",
      boxSizing: "border-box"
    }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .grid-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .banner-slide {
          animation: slideIn 0.35s ease-out;
        }
      `}</style>

      {/* Header bar */}
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>LinkUp</h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary, #64748b)" }}>Find four groups of four!</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setPhase("rules")}
            style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "#4f46e5",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            ℹ️ Rules
          </button>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#059669", padding: "6px 12px", borderRadius: "8px", fontWeight: 800, fontSize: "0.85rem" }}>
            {currentScore}/100 pts
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0f172a",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "0.95rem",
          zIndex: 9999,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}>
          {toastMessage}
        </div>
      )}

      {/* Solved Category Banners */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
        {solvedCategories.map((cat, idx) => {
          const colorScheme = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.yellow;
          return (
            <div
              key={idx}
              className="banner-slide"
              style={{
                background: colorScheme.bg,
                border: `1.5px solid ${colorScheme.border}`,
                borderRadius: "12px",
                padding: "14px 16px",
                textAlign: "center",
                color: colorScheme.text,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
              }}
            >
              <div style={{ fontWeight: 800, fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                {cat.category}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.95 }}>
                {cat.items.join(", ")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Remaining Unsolved Words Grid */}
      {remainingWords.length > 0 && (
        <div
          className={isShaking ? "grid-shake" : ""}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            width: "100%",
            marginBottom: "20px"
          }}
        >
          {remainingWords.map(word => {
            const isSelected = selectedWords.includes(word);
            return (
              <button
                key={word}
                onClick={() => handleTileClick(word)}
                style={{
                  background: isSelected ? "#334155" : "#f1f5f9",
                  color: isSelected ? "#ffffff" : "#0f172a",
                  border: isSelected ? "2px solid #0f172a" : "2px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "14px 4px",
                  fontWeight: 800,
                  fontSize: "clamp(0.70rem, 2.2vw, 0.85rem)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minHeight: "72px",
                  lineHeight: 1.25,
                  transition: "all 0.15s ease",
                  transform: isSelected ? "translateY(-2px)" : "none",
                  boxShadow: isSelected ? "0 6px 14px rgba(0,0,0,0.1)" : "none"
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {/* Mistakes Remaining Indicator */}
      {!isGameOver && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#64748b" }}>Mistakes remaining:</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: i < mistakesRemaining ? "#475569" : "#cbd5e1",
                  transition: "background 0.2s"
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isGameOver && remainingWords.length > 0 && (
        <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "center" }}>
          <button
            onClick={handleShuffle}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "20px",
              border: "1.5px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            Shuffle
          </button>
          <button
            onClick={handleDeselectAll}
            disabled={selectedWords.length === 0}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "20px",
              border: "1.5px solid #cbd5e1",
              background: "#ffffff",
              color: selectedWords.length === 0 ? "#94a3b8" : "#334155",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: selectedWords.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            Deselect All
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length !== 4}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "20px",
              border: "none",
              background: selectedWords.length === 4 ? "#0f172a" : "#cbd5e1",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: selectedWords.length === 4 ? "pointer" : "not-allowed",
              transition: "background 0.2s"
            }}
          >
            Submit (4)
          </button>
        </div>
      )}

      {/* Game Over / Results Screen */}
      {isGameOver && (
        <div style={{
          background: hasWon ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
          border: `1.5px solid ${hasWon ? "#10b981" : "#f59e0b"}`,
          borderRadius: "16px",
          padding: "20px",
          width: "100%",
          textAlign: "center",
          marginTop: "12px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
            {hasWon ? "🏆" : "🎯"}
          </div>
          <h3 style={{ margin: "0 0 6px 0", color: hasWon ? "#059669" : "#b45309", fontWeight: 800, fontSize: "1.25rem" }}>
            {hasWon ? "Splendid! All 4 Groups Solved!" : `Round Complete: You Banked ${currentScore} Points!`}
          </h3>
          <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem", color: "#475569" }}>
            {hasWon 
              ? "You earned the maximum 100 points (+25 pts per group)!" 
              : `You solved ${solvedCategories.length}/4 groups and earned +${currentScore} points (25 pts per group)!`}
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleRestart}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                border: "1.5px solid #cbd5e1",
                background: "#ffffff",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "#334155",
                cursor: "pointer"
              }}
            >
              🔄 Replay This Puzzle
            </button>
            {hasNextPuzzle && onNextPuzzle && (
              <button
                onClick={onNextPuzzle}
                style={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  color: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)"
                }}
              >
                Play Next Puzzle ➔
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
