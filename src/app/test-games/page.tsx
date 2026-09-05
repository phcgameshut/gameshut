"use client";

import { useState } from "react";
import Link from "next/link";
import LinkUp, { CategoryGroup } from "../games/components/LinkUp";

const TEST_PUZZLES: { title: string; subtitle: string; categories: CategoryGroup[] }[] = [
  {
    title: "Puzzle 1: Heritage, Geography & Games",
    subtitle: "Soups, Instruments, River States & Monopoly",
    categories: [
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
        category: "Components in a Monopoly Box",
        items: ["CHANCE CARDS", "HOTEL TOKENS", "TOP HAT PAWN", "PLAY MONEY"],
        color: "purple"
      }
    ]
  },
  {
    title: "Puzzle 2: Culture, Cinema & Geography",
    subtitle: "Street Food, Nollywood Legends, Equator & Cards",
    categories: [
      {
        category: "Popular Nigerian Street Foods",
        items: ["SUYA", "AKARA", "BOLI", "KILISHI"],
        color: "yellow"
      },
      {
        category: "Pioneering Nollywood Icons",
        items: ["GENEVIEVE NNAJI", "PETE EDOCHIE", "RAMSEY NOUAH", "OMOTOLA JALADE"],
        color: "green"
      },
      {
        category: "African Countries on the Equator",
        items: ["KENYA", "UGANDA", "GABON", "SOMALIA"],
        color: "blue"
      },
      {
        category: "Classic Card Games",
        items: ["WHIST", "BLACKJACK", "SOLITAIRE", "POKER"],
        color: "purple"
      }
    ]
  },
  {
    title: "Puzzle 3: Street Dance, Seaports & Style",
    subtitle: "Dances, West African Ports, Headwear & Boards",
    categories: [
      {
        category: "Famous Nigerian Street Dances",
        items: ["SHAKU SHAKU", "ZANKU", "GALALA", "ALANTA"],
        color: "yellow"
      },
      {
        category: "Major Seaports in West Africa",
        items: ["APAPA", "TIN CAN", "TEMA", "COTONOU"],
        color: "green"
      },
      {
        category: "Traditional Headwear",
        items: ["GELE", "FILA", "TURBAN", "BERET"],
        color: "blue"
      },
      {
        category: "Sports Played on a Board",
        items: ["CHESS", "SKATEBOARDING", "SURFING", "CARROM"],
        color: "purple"
      }
    ]
  }
];

export default function TestGamesPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [puzzleKey, setPuzzleKey] = useState(0);

  const currentPuzzle = TEST_PUZZLES[selectedIdx];

  const handleNextPuzzle = () => {
    if (selectedIdx < TEST_PUZZLES.length - 1) {
      setSelectedIdx(prev => prev + 1);
      setPuzzleKey(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container" style={{ padding: "40px 16px 80px 16px", minHeight: "90vh", maxWidth: "700px", margin: "0 auto" }}>
      {/* Top Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <Link 
          href="/games" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--color-brand, #4f46e5)", 
            fontWeight: 700, 
            textDecoration: "none",
            fontSize: "0.95rem"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Games
        </Link>
        <span style={{ fontSize: "0.8rem", fontWeight: 800, padding: "4px 12px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.1)", color: "#4f46e5" }}>
          GamesHut LinkUp Test
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 800, margin: "0 0 8px 0" }}>
          LinkUp Gameplay Test
        </h1>
        <p style={{ color: "var(--text-secondary, #64748b)", fontSize: "1rem", margin: 0 }}>
          Test the official rules, difficulty (8/10), and the <strong>+25 pts per correct group</strong> scoring.
        </p>
      </div>

      {/* Puzzle Selector Bar */}
      <div style={{ 
        background: "#ffffff", 
        border: "1px solid var(--card-border, #e2e8f0)", 
        borderRadius: "16px", 
        padding: "12px 16px", 
        marginBottom: "28px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>Choose Puzzle:</span>
          {TEST_PUZZLES.map((puzzle, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedIdx(idx);
                setPuzzleKey(prev => prev + 1);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: selectedIdx === idx ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                background: selectedIdx === idx ? "rgba(99, 102, 241, 0.1)" : "#f8fafc",
                color: selectedIdx === idx ? "#4f46e5" : "#334155",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              Puzzle {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPuzzleKey(prev => prev + 1)}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "#334155",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          🔄 Restart Puzzle
        </button>
      </div>

      {/* Playable Arena with Rule Screen */}
      <div style={{
        background: "#ffffff",
        border: "1px solid var(--card-border, #e2e8f0)",
        borderRadius: "24px",
        padding: "20px 12px",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
      }}>
        <LinkUp
          key={puzzleKey}
          challenge={{
            content: {
              categories: currentPuzzle.categories,
              theme: currentPuzzle.title
            }
          }}
          hasNextPuzzle={selectedIdx < TEST_PUZZLES.length - 1}
          onNextPuzzle={handleNextPuzzle}
          onComplete={(score, resultData) => {
            console.log("LinkUp finished:", score, resultData);
          }}
        />
      </div>
    </div>
  );
}
