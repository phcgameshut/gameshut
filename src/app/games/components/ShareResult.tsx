import React, { useState } from 'react';

export default function ShareResult({ 
  gameType, 
  score, 
  maxScore, 
  challengeNumber, 
  resultData 
}: { 
  gameType: string, 
  score: number, 
  maxScore: number, 
  challengeNumber: number,
  resultData?: any
}) {
  const [copied, setCopied] = useState(false);

  const getEmojiGrid = () => {
    if (gameType === 'trivia') {
      // resultData might be an array of booleans indicating correct/incorrect per question
      if (Array.isArray(resultData)) {
        return resultData.map(r => r ? '🟩' : '🟥').join('');
      }
      // Fallback
      return Array(score).fill('🟩').join('') + Array(maxScore - score).fill('🟥').join('');
    }
    // Generic fallback for other games
    return `Score: ${score}/${maxScore}`;
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      'trivia': 'Daily Trivia',
      'word-hunt': 'Word Hunt',
      'match-up': 'Match Up',
      'who-am-i': 'Who Am I?',
      'mystery': 'Daily Mystery'
    };
    return titles[gameType] || 'GamesHut Daily';
  };

  const generateShareText = () => {
    const title = getTitle();
    const grid = getEmojiGrid();
    return `GamesHut ${title} #${challengeNumber}\n\n${grid}\n\nPlay at gameshut.com/games`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My GamesHut Result`,
          text: text,
        });
        return;
      } catch (e) {
        // Fallback to clipboard if share fails or is cancelled
      }
    }
    
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontWeight: 700 }}>Share Your Result</h3>
      <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '2px', marginBottom: '16px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        {getEmojiGrid()}
      </div>
      <button 
        onClick={handleShare}
        className="btn-primary" 
        style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        {copied ? 'Copied to Clipboard!' : 'Share Result 🔗'}
      </button>
    </div>
  );
}
