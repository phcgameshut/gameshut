"use client";

import { useState, useEffect } from "react";
import GameRules from "./GameRules";

type Phase = "rules" | "playing" | "gameover";

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
  standalone?: boolean;
}

const CATEGORY_COLORS = {
  yellow: { bg: "#fef08a", border: "#facc15", text: "#854d0e", badge: "Straightforward" },
  green: { bg: "#bbf7d0", border: "#4ade80", text: "#166534", badge: "Culture & Facts" },
  blue: { bg: "#bfdbfe", border: "#60a5fa", text: "#1e40af", badge: "Word Association" },
  purple: { bg: "#e9d5ff", border: "#c084fc", text: "#6b21a8", badge: "Clever / Tricky" }
};

export default function LinkUp({
  challenge,
  onComplete,
  onCancel,
  standalone = false
}: LinkUpProps) {
  const [phase, setPhase] = useState<Phase>(standalone ? "playing" : "rules");

  const categories: CategoryGroup[] = challenge?.content?.categories || [
    {
      category: "Nigerian Street Foods",
      items: ["SUYA", "AKARA", "BOLI", "KILISHI"],
      color: "yellow"
    },
    {
      category: "Popular Afrobeats Dances",
      items: ["ZANKU", "SHAKU", "GALALA", "NETWORK"],
      color: "green"
    },
    {
      category: "Found in a Board Game Box",
      items: ["DICE", "TIMER", "TOKEN", "CARDS"],
      color: "blue"
    },
    {
      category: "Words that follow 'BOARD'",
      items: ["GAME", "ROOM", "WALK", "SCORE"],
      color: "purple"
    }
  ];

  const theme = challenge?.content?.theme || "Nigerian & Global Associations";

  // State
  const [solvedCategories, setSolvedCategories] = useState<CategoryGroup[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [mistakesRemaining, setMistakesRemaining] = useState(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Initialize remaining words with shuffle
  useEffect(() => {
    const allWords = categories.flatMap(c => c.items.map(w => w.toUpperCase()));
    setRemainingWords([...allWords].sort(() => Math.random() - 0.5));
    setSolvedCategories([]);
    setSelectedWords([]);
    setMistakesRemaining(4);
    setIsGameOver(false);
    setHasWon(false);
  }, [challenge]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
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

  const calculateScore = (mistakesLeft: number, won: boolean) => {
    if (!won) return 0;
    const scores = [40, 60, 80, 100];
    return scores[mistakesLeft] || 40;
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
        // All solved!
        setIsGameOver(true);
        setHasWon(true);
        const score = calculateScore(mistakesRemaining, true);
        showToast("Brilliant! You solved all LinkUps! 🏆");
        if (onComplete) {
          setTimeout(() => onComplete(score, { mistakesRemaining, solvedCount: 4 }), 1800);
        }
      }
    } else {
      // Wrong
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);

      const nextMistakes = mistakesRemaining - 1;
      setMistakesRemaining(nextMistakes);

      if (isOneAway) {
        showToast("One away... 🤏");
      } else {
        showToast("Not quite! Try another combination.");
      }

      if (nextMistakes <= 0) {
        // Out of mistakes
        setIsGameOver(true);
        setHasWon(false);
        // Reveal remaining categories
        setSolvedCategories(categories);
        setRemainingWords([]);
        setSelectedWords([]);
        showToast("Game Over! All categories revealed.");
        if (onComplete) {
          setTimeout(() => onComplete(0, { mistakesRemaining: 0, failed: true }), 2200);
        }
      }
    }
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
          "Find 4 groups of 4 words that share a secret link",
          "Tap 4 words that belong together, then press Submit",
          <span key="diff">Categories are color-coded by difficulty: <strong style={{ color: "#ca8a04" }}>Yellow</strong> (easiest) to <strong style={{ color: "#7e22ce" }}>Purple</strong> (tricky wordplay)</span>,
          "You have 4 mistakes allowed before the game ends",
          "Watch out for words that seem to fit multiple categories!"
        ]}
        onStart={() => setPhase("playing")}
        onCancel={onCancel}
        ctaText="Play LinkUp"
      />
    );
  }

  return (
    <div style={{
      maxWidth: "540px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      userSelect: "none",
      padding: "10px"
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
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary, #64748b)" }}>Create four groups of four!</span>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: "6px" }}
          >
            ✕
          </button>
        )}
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

      {/* Solved Banners */}
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
              <div style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.9 }}>
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
                  fontSize: "clamp(0.72rem, 2.5vw, 0.88rem)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minHeight: "68px",
                  lineHeight: 1.2,
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
            Submit
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div style={{
          background: hasWon ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          border: `1px solid ${hasWon ? "#10b981" : "#ef4444"}`,
          borderRadius: "14px",
          padding: "16px 20px",
          width: "100%",
          textAlign: "center",
          marginTop: "10px"
        }}>
          <h3 style={{ margin: "0 0 6px 0", color: hasWon ? "#059669" : "#dc2626", fontWeight: 800 }}>
            {hasWon ? `Splendid! +${calculateScore(mistakesRemaining, true)} Points Earned` : "Game Over! All groups revealed."}
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
            {hasWon ? "Your pattern recognition is elite!" : "Connections can be tricky. Try another puzzle to sharpen your skills!"}
          </p>
        </div>
      )}
    </div>
  );
}
