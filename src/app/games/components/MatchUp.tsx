"use client";

import { useState } from "react";
import { DailyChallenge } from "@/lib/storage";
import ShareResult from "./ShareResult";

export default function MatchUp({ challenge, onComplete }: { challenge: DailyChallenge, onComplete: (score: number, resultData: any) => void }) {
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const handleFinish = () => {
    setScore(5);
    setIsGameOver(true);
  };

  if (isGameOver) {
    return (
      <div style={{ textAlign: 'center' }}>
        <ShareResult gameType={challenge.gameTypeId} score={score} maxScore={5} challengeNumber={challenge.challengeNumber} resultData={{}} />
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => onComplete(score, {})}>Save & Return to Hub</button>
      </div>
    );
  }

  return (
    <div className="corp-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Match Up</h3>
      <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Drag and drop items to match their pairs.</p>
      
      {/* Real Match Up logic goes here */}
      <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '12px', marginBottom: '20px' }}>
        [ Match Up Drag-and-Drop Placeholder ]
      </div>

      <button className="btn-primary" onClick={handleFinish}>Simulate Win (5 XP)</button>
    </div>
  );
}
