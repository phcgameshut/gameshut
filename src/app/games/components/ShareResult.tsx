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
    return `GamesHut ${title} #${challengeNumber}\n\n${grid}\n\nCan you beat my score? Play now at gameshut.ng/games`;
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
    <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', fontWeight: 800, color: 'var(--text-primary)' }}>Share Your Victory</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>Challenge your friends to beat your score!</p>
      
      <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', letterSpacing: '4px', marginBottom: '24px', background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
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
