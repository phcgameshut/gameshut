"use client";

import { useState, useEffect, useCallback } from "react";
import GameRules from "./GameRules";

type Phase = "rules" | "playing" | "gameover";

interface WordLockProps {
  challenge?: {
    content?: {
      targetWord?: string;
      theme?: string;
      hint?: string;
    };
    challengeNumber?: number;
  };
  onComplete?: (score: number, resultData: any) => void;
  onCancel?: () => void;
  standalone?: boolean;
}

const COMMON_5_LETTER_WORDS = new Set([
  "ABOUT", "ABOVE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT",
  "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG",
  "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE",
  "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "BADLY",
  "BAKER", "BASES", "BASIC", "BASIS", "BEACH", "BEGAN", "BEGIN", "BEGUN", "BEING", "BELOW",
  "BENCH", "BILLY", "BIRTH", "BLACK", "BLAME", "BLIND", "BLOCK", "BLOOD", "BOARD", "BOAST",
  "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BREAD", "BREAK", "BREED", "BRIEF", "BRING",
  "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CARRY", "CATCH",
  "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD",
  "CHINA", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE",
  "COACH", "COAST", "COULD", "COUNT", "COURT", "COVER", "CRAFT", "CRASH", "CREAM", "CRIME",
  "CROSS", "CROWD", "CROWN", "CURLY", "CURVE", "CYCLE", "DAILY", "DANCE", "DATED", "DEALT",
  "DEATH", "DEBUT", "DELAY", "DELTA", "DEPTH", "DOING", "DOUBT", "DOZEN", "DRAFT", "DRAMA",
  "DRAWN", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY",
  "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR",
  "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER", "FIELD",
  "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLOOR", "FLUID",
  "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRAUD", "FRESH", "FRONT",
  "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE",
  "GRAND", "GRANT", "GRASS", "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS",
  "GUEST", "GUIDE", "HAPPY", "HARRY", "HEART", "HEAVY", "HENCE", "HENRY", "HORSE", "HOTEL",
  "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "JAPAN", "JIMMY",
  "JOINT", "JONES", "JUDGE", "KNOWN", "LABEL", "LAGOS", "LARGE", "LASER", "LATER", "LAUGH",
  "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LEWIS", "LIGHT", "LIMIT",
  "LINKS", "LIVES", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYING", "MAGIC",
  "MAJOR", "MAKER", "MARCH", "MARIA", "MATCH", "MAYBE", "MAYOR", "MEANT", "MEDIA", "METAL",
  "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT",
  "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIRA", "NEEDS", "NEVER", "NEWLY", "NIGHT", "NOISE",
  "NORTH", "NOTED", "NOVEL", "NURSE", "OCCUR", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER",
  "OUGHT", "PAINT", "PANEL", "PAPER", "PARTY", "PEACE", "PETER", "PHASE", "PHONE", "PHOTO",
  "PIECE", "PILOT", "PITCH", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND",
  "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD",
  "PROVE", "QUEEN", "QUICK", "QUIET", "QUITE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO",
  "REACH", "READY", "REFER", "RIGHT", "RIVAL", "RIVER", "ROBIN", "ROGER", "ROMAN", "ROUGH",
  "ROUND", "ROUTE", "ROYAL", "RURAL", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE", "SERVE",
  "SEVEN", "SHALL", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHIRT",
  "SHOCK", "SHOOT", "SHORT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SIXTY", "SIZED", "SKILL",
  "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY",
  "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPENT", "SPLIT", "SPOKE",
  "SPORT", "STAFF", "STAGE", "STAKE", "STAND", "START", "STATE", "STEAM", "STEEL", "STICK",
  "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY",
  "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "TABLE", "TAKEN", "TASTE", "TAXES",
  "TEACH", "TEETH", "TERRY", "TEXAS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE",
  "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMES",
  "TIRED", "TITLE", "TODAY", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE",
  "TRAIN", "TREAT", "TREND", "TRIAL", "TRIED", "TRIES", "TRUCK", "TRULY", "TRUST", "TRUTH",
  "TWICE", "UNDER", "UNDUE", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE",
  "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH",
  "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN",
  "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "WROTE",
  "YIELD", "YOUNG", "YOUTH"
]);

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

export default function WordLock({
  challenge,
  onComplete,
  onCancel,
  standalone = false
}: WordLockProps) {
  const [phase, setPhase] = useState<Phase>(standalone ? "playing" : "rules");
  const targetWord = (challenge?.content?.targetWord || "LAGOS").toUpperCase();
  const theme = challenge?.content?.theme || "Nigerian & Global Knowledge";
  const hint = challenge?.content?.hint || "";

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  const getLetterStatus = (letter: string, index: number, word: string): "correct" | "present" | "absent" => {
    if (targetWord[index] === letter) return "correct";
    if (targetWord.includes(letter)) return "present";
    return "absent";
  };

  // Build keyboard state based on guesses
  const keyboardState: Record<string, "correct" | "present" | "absent"> = {};
  guesses.forEach(guess => {
    guess.split("").forEach((letter, i) => {
      const status = getLetterStatus(letter, i, guess);
      const current = keyboardState[letter];
      if (status === "correct") {
        keyboardState[letter] = "correct";
      } else if (status === "present" && current !== "correct") {
        keyboardState[letter] = "present";
      } else if (!current) {
        keyboardState[letter] = "absent";
      }
    });
  });

  const calculateScore = (attempts: number, won: boolean) => {
    if (!won) return 0;
    const scores = [100, 85, 70, 55, 40, 25];
    return scores[attempts - 1] || 25;
  };

  const handleKeyPress = useCallback((key: string) => {
    if (isGameOver) return;

    if (key === "ENTER") {
      if (currentGuess.length !== 5) {
        showToast("Not enough letters");
        setShakeRow(guesses.length);
        setTimeout(() => setShakeRow(null), 600);
        return;
      }

      // Check if word is valid English or the target word
      if (!COMMON_5_LETTER_WORDS.has(currentGuess) && currentGuess !== targetWord) {
        showToast("Not in word list");
        setShakeRow(guesses.length);
        setTimeout(() => setShakeRow(null), 600);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (currentGuess === targetWord) {
        setIsGameOver(true);
        setHasWon(true);
        const finalScore = calculateScore(newGuesses.length, true);
        showToast("Splendid! 🎉");
        if (onComplete) {
          setTimeout(() => onComplete(finalScore, { attempts: newGuesses.length, targetWord }), 1600);
        }
      } else if (newGuesses.length >= 6) {
        setIsGameOver(true);
        setHasWon(false);
        showToast(`The word was ${targetWord}`);
        if (onComplete) {
          setTimeout(() => onComplete(0, { attempts: 6, targetWord, failed: true }), 2000);
        }
      }
    } else if (key === "BACKSPACE" || key === "⌫") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, guesses, isGameOver, targetWord, onComplete]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      if (e.key === "Enter") {
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        handleKeyPress("BACKSPACE");
      } else {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          handleKeyPress(key);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, phase]);

  if (phase === "rules") {
    return (
      <GameRules
        title="WordLock"
        theme={theme}
        icon={
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        }
        instructions={[
          "Guess the hidden 5-letter word in 6 tries or less",
          <span key="green">Tiles turn <strong style={{ color: "#10b981" }}>GREEN</strong> if the letter is in the exact right spot</span>,
          <span key="yellow">Tiles turn <strong style={{ color: "#f59e0b" }}>YELLOW</strong> if the letter is in the word but wrong spot</span>,
          <span key="gray">Tiles turn <strong style={{ color: "#64748b" }}>GRAY</strong> if the letter is not in the word</span>,
          "The fewer guesses you use, the higher your score!"
        ]}
        onStart={() => setPhase("playing")}
        onCancel={onCancel}
        ctaText="Crack the Lock"
      />
    );
  }

  return (
    <div style={{
      maxWidth: "500px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "75vh",
      justifyContent: "space-between",
      userSelect: "none"
    }}>
      <style>{`
        @keyframes flipIn {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .tile-pop {
          animation: popIn 0.12s ease-out;
        }
        .row-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      {/* Header bar */}
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 10px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>WordLock</h2>
          {hint && <span style={{ fontSize: "0.8rem", color: "var(--text-secondary, #64748b)" }}>Hint: {hint}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, padding: "4px 10px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.1)", color: "#4f46e5" }}>
            Attempt {Math.min(guesses.length + (isGameOver ? 0 : 1), 6)}/6
          </span>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: "6px" }}
            >
              ✕
            </button>
          )}
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

      {/* 6x5 Letter Grid */}
      <div style={{
        display: "grid",
        gridTemplateRows: "repeat(6, 1fr)",
        gap: "6px",
        width: "min(340px, 90vw)",
        height: "min(400px, 50vh)",
        margin: "0 auto 20px auto"
      }}>
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const isCompletedRow = rowIndex < guesses.length;
          const guess = isCompletedRow ? guesses[rowIndex] : (isCurrentRow ? currentGuess : "");
          const isShaking = shakeRow === rowIndex;

          return (
            <div
              key={rowIndex}
              className={isShaking ? "row-shake" : ""}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "6px"
              }}
            >
              {Array.from({ length: 5 }).map((__, colIndex) => {
                const letter = guess[colIndex] || "";
                let bgColor = "#ffffff";
                let borderColor = "#cbd5e1";
                let textColor = "#0f172a";

                if (isCompletedRow) {
                  const status = getLetterStatus(letter, colIndex, guess);
                  if (status === "correct") {
                    bgColor = "#10b981";
                    borderColor = "#10b981";
                    textColor = "#ffffff";
                  } else if (status === "present") {
                    bgColor = "#f59e0b";
                    borderColor = "#f59e0b";
                    textColor = "#ffffff";
                  } else {
                    bgColor = "#64748b";
                    borderColor = "#64748b";
                    textColor = "#ffffff";
                  }
                } else if (letter) {
                  borderColor = "#475569";
                }

                return (
                  <div
                    key={colIndex}
                    className={letter && isCurrentRow ? "tile-pop" : ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: `2px solid ${borderColor}`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
                      fontWeight: 800,
                      backgroundColor: bgColor,
                      color: textColor,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Result Card when Game Over */}
      {isGameOver && (
        <div style={{
          background: hasWon ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          border: `1px solid ${hasWon ? "#10b981" : "#ef4444"}`,
          borderRadius: "14px",
          padding: "16px 20px",
          width: "min(340px, 90vw)",
          marginBottom: "16px",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 6px 0", color: hasWon ? "#059669" : "#dc2626", fontWeight: 800 }}>
            {hasWon ? `Unlocked in ${guesses.length}/6! +${calculateScore(guesses.length, true)} pts` : `Game Over! The word was "${targetWord}"`}
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
            {hasWon ? "Outstanding vocabulary and deduction!" : "Better luck tomorrow! Come back to keep your streak."}
          </p>
        </div>
      )}

      {/* On-Screen Tactile Keyboard */}
      <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "6px", padding: "0 4px" }}>
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
            {row.map(key => {
              const status = keyboardState[key];
              let bg = "#e2e8f0";
              let color = "#0f172a";

              if (status === "correct") {
                bg = "#10b981";
                color = "#ffffff";
              } else if (status === "present") {
                bg = "#f59e0b";
                color = "#ffffff";
              } else if (status === "absent") {
                bg = "#94a3b8";
                color = "#ffffff";
              }

              const isSpecial = key === "ENTER" || key === "⌫";

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  style={{
                    flex: isSpecial ? 1.5 : 1,
                    height: "52px",
                    borderRadius: "6px",
                    border: "none",
                    background: bg,
                    color: color,
                    fontWeight: 700,
                    fontSize: isSpecial ? "0.75rem" : "1.05rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    touchAction: "manipulation",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    transition: "transform 0.05s ease, background 0.2s ease"
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                  onTouchStart={e => e.currentTarget.style.transform = "scale(0.95)"}
                  onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
