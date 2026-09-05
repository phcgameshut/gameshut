"use client";

import { useState } from "react";
import Link from "next/link";
import WordLock from "../games/components/WordLock";
import LinkUp, { CategoryGroup } from "../games/components/LinkUp";

const WORDLOCK_PRESETS = [
  { word: "NAIRA", theme: "Nigerian Economy & Currency", hint: "Official currency of Nigeria" },
  { word: "LAGOS", theme: "Famous African Megacity", hint: "Centre of Excellence" },
  { word: "JOLLY", theme: "Celebration & Good Times", hint: "Happy and cheerful vibe" },
  { word: "DELTA", theme: "Nigerian Geography", hint: "The Big Heart state" },
  { word: "BREAD", theme: "Everyday Foods", hint: "Goes great with Agege butter" }
];

const LINKUP_PRESETS: { name: string; categories: CategoryGroup[] }[] = [
  {
    name: "Set 1: Street Food & Pop Culture",
    categories: [
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
    ]
  },
  {
    name: "Set 2: African Geography & Wordplay",
    categories: [
      {
        category: "African Capital Cities",
        items: ["NAIROBI", "ACCRA", "DAKAR", "CAIRO"],
        color: "yellow"
      },
      {
        category: "Traditional African Fabrics",
        items: ["ANKARA", "ASO-OKE", "KENTE", "ADIRE"],
        color: "green"
      },
      {
        category: "Words with musical roots",
        items: ["SOLO", "BEAT", "BASS", "CHORD"],
        color: "blue"
      },
      {
        category: "Things that have 'Keys'",
        items: ["PIANO", "KINGDOM", "KEYBOARD", "ISLAND"],
        color: "purple"
      }
    ]
  }
];

export default function TestGamesPage() {
  const [activeTab, setActiveTab] = useState<"wordlock" | "linkup">("wordlock");
  const [selectedWordLockIdx, setSelectedWordLockIdx] = useState(0);
  const [selectedLinkUpIdx, setSelectedLinkUpIdx] = useState(0);
  const [wordLockKey, setWordLockKey] = useState(0);
  const [linkUpKey, setLinkUpKey] = useState(0);

  const currentWordLock = WORDLOCK_PRESETS[selectedWordLockIdx];
  const currentLinkUp = LINKUP_PRESETS[selectedLinkUpIdx];

  return (
    <div className="container" style={{ padding: "40px 16px", minHeight: "90vh", maxWidth: "800px", margin: "0 auto" }}>
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
          Gameplay Testing Lab
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 800, margin: "0 0 10px 0" }}>
          Test the New Games
        </h1>
        <p style={{ color: "var(--text-secondary, #64748b)", fontSize: "1.05rem", margin: 0 }}>
          Play both games below to test the mechanics, animations, and feel.
        </p>
      </div>

      {/* Game Selector Tabs */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "12px", 
        background: "#f1f5f9", 
        padding: "6px", 
        borderRadius: "16px", 
        marginBottom: "32px" 
      }}>
        <button
          onClick={() => setActiveTab("wordlock")}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            fontWeight: 800,
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: activeTab === "wordlock" ? "#ffffff" : "transparent",
            color: activeTab === "wordlock" ? "#0f172a" : "#64748b",
            boxShadow: activeTab === "wordlock" ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🔠</span> WordLock (Wordle)
        </button>

        <button
          onClick={() => setActiveTab("linkup")}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            fontWeight: 800,
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: activeTab === "linkup" ? "#ffffff" : "transparent",
            color: activeTab === "linkup" ? "#0f172a" : "#64748b",
            boxShadow: activeTab === "linkup" ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🧩</span> LinkUp (Connections)
        </button>
      </div>

      {/* Preset Pickers */}
      <div style={{ 
        background: "#ffffff", 
        border: "1px solid var(--card-border, #e2e8f0)", 
        borderRadius: "16px", 
        padding: "16px 20px", 
        marginBottom: "32px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px"
      }}>
        {activeTab === "wordlock" ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>Test Word:</span>
              {WORDLOCK_PRESETS.map((preset, idx) => (
                <button
                  key={preset.word}
                  onClick={() => {
                    setSelectedWordLockIdx(idx);
                    setWordLockKey(prev => prev + 1);
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: selectedWordLockIdx === idx ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                    background: selectedWordLockIdx === idx ? "rgba(99, 102, 241, 0.1)" : "#f8fafc",
                    color: selectedWordLockIdx === idx ? "#4f46e5" : "#334155",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  {preset.word}
                </button>
              ))}
            </div>
            <button
              onClick={() => setWordLockKey(prev => prev + 1)}
              style={{
                padding: "8px 16px",
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
              🔄 Reset Game
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>Test Puzzle:</span>
              {LINKUP_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setSelectedLinkUpIdx(idx);
                    setLinkUpKey(prev => prev + 1);
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: selectedLinkUpIdx === idx ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                    background: selectedLinkUpIdx === idx ? "rgba(99, 102, 241, 0.1)" : "#f8fafc",
                    color: selectedLinkUpIdx === idx ? "#4f46e5" : "#334155",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setLinkUpKey(prev => prev + 1)}
              style={{
                padding: "8px 16px",
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
              🔄 Reset Puzzle
            </button>
          </>
        )}
      </div>

      {/* Playable Arena */}
      <div style={{
        background: "#ffffff",
        border: "1px solid var(--card-border, #e2e8f0)",
        borderRadius: "24px",
        padding: "24px 16px",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
      }}>
        {activeTab === "wordlock" ? (
          <WordLock
            key={wordLockKey}
            challenge={{
              content: {
                targetWord: currentWordLock.word,
                theme: currentWordLock.theme,
                hint: currentWordLock.hint
              }
            }}
            standalone={true}
            onComplete={(score, resultData) => {
              console.log("WordLock completed:", score, resultData);
            }}
          />
        ) : (
          <LinkUp
            key={linkUpKey}
            challenge={{
              content: {
                categories: currentLinkUp.categories,
                theme: currentLinkUp.name
              }
            }}
            standalone={true}
            onComplete={(score, resultData) => {
              console.log("LinkUp completed:", score, resultData);
            }}
          />
        )}
      </div>
    </div>
  );
}
