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

  const getShareGridText = () => {
    if (gameType === 'trivia') {
      const answersArray = resultData?.answers || [];
      if (Array.isArray(answersArray) && answersArray.length > 0) {
        return answersArray.map((r: any) => r ? '🟩' : '🟥').join('');
      }
      // Fallback if no result data
      const qCount = 5; // Default assumption for trivia
      const correct = Math.round((score / maxScore) * qCount);
      return Array(Math.max(0, correct)).fill('🟩').join('') + Array(Math.max(0, qCount - correct)).fill('🟥').join('');
    }
    return `Score: ${score}/${maxScore}`;
  };

  const renderScoreDisplay = () => {
    if (gameType === 'trivia') {
      return (
        <div style={{ letterSpacing: '4px', fontSize: '1.4rem' }}>
          {getShareGridText()}
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Final Score</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1, letterSpacing: '0px' }}>
          {score}<span style={{ fontSize: '1.5rem', color: '#cbd5e1' }}>/{maxScore}</span>
        </div>
      </div>
    );
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
    const grid = getShareGridText();
    
    let message = "I just crushed today's";
    let suffixEmoji = "🏆";
    
    if (score === 0) {
      message = "I just got humbled by today's";
      suffixEmoji = "😅";
    } else if (score < maxScore / 2) {
      message = "I survived today's";
      suffixEmoji = "💪";
    }

    return `${message} ${title} on GamesHut! ${suffixEmoji}\n\n${grid}\n\nThink you can beat my score? Try it here: gameshut.ng/games`;
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
    <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', border: 'none', textAlign: 'center', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2)' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: 800, color: '#ffffff' }}>
        {score === maxScore ? "Perfect Score! 🏆" : (score > maxScore / 2 ? "Share Your Victory! 🎉" : "Share Your Result")}
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', marginBottom: '24px', fontWeight: 500 }}>
        {score === maxScore ? "Challenge your friends to match your perfect run" : "Challenge your friends to beat your score"}
      </p>
      
      <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#0f172a' }}>
        {renderScoreDisplay()}
      </div>
      <button 
        onClick={handleShare}
        style={{ padding: '12px 28px', background: '#ffffff', color: '#059669', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        {copied ? 'Copied!' : 'Share Result'}
      </button>
    </div>
  );
}
