"use client";

import { useState, useEffect } from "react";
import { DailyChallenge } from "@/lib/storage";
import ShareResult from "./ShareResult";
import GameRules from "./GameRules";

interface TriviaQuestion {
  q: string;
  options: string[];
  answer: string; // The correct option exactly as a string, or index
  explanation?: string;
}

type DailyTriviaProps = {
  challenge: DailyChallenge;
  onComplete: (score: number, resultData: any) => void;
  onCancel?: () => void;
};

export default function DailyTrivia({ challenge, onComplete, onCancel }: DailyTriviaProps) {
  const [phase, setPhase] = useState<"rules" | "playing">("rules");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  useEffect(() => {
    if (phase === "playing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase, currentIndex]);

  const questions: TriviaQuestion[] = challenge.content?.questions || [];
  const currentQuestion = questions[currentIndex];

  if (phase === "rules") {
    return (
      <GameRules 
        title="Daily Trivia"
        icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>}
        instructions={[
          `Answer ${questions.length} questions with an African/Nigerian twist`,
          "Pick one answer from 4 options",
          <span key="points">Each correct answer earns you <strong style={{ color: "var(--accent-primary)" }}>20 points</strong></span>,
          "You'll see an explanation after every answer",
          "No time limit — think carefully!"
        ]}
        onStart={() => setPhase("playing")}
        onCancel={onCancel}
      />
    );
  }



  if (!currentQuestion) {
    return <div className="p-4 text-center">Trivia content is malformed.</div>;
  }

  const handleSelect = (option: string) => {
    if (isRevealed) return;
    setSelectedOption(option);
    setIsRevealed(true);

    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers(prev => [...prev, isCorrect]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsRevealed(false);
    } else {
      // Game over
      onComplete(score * (100 / questions.length), { answers });
    }
  };

  return (
    <div className="trivia-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span style={{ fontWeight: 600, color: 'var(--color-brand)' }}>
          Score: {score}
        </span>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 700, lineHeight: 1.4 }}>
          {currentQuestion.q}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options.map((option, idx) => {
            const isCorrectOption = option === currentQuestion.answer;
            const isSelected = selectedOption === option;
            
            let bg = 'var(--bg-secondary)';
            let color = 'var(--text-primary)';
            let border = '1px solid var(--border-color)';

            if (isRevealed) {
              if (isCorrectOption) {
                bg = '#10b981'; // green
                color = 'white';
                border = '1px solid #10b981';
              } else if (isSelected) {
                bg = '#ef4444'; // red
                color = 'white';
                border = '1px solid #ef4444';
              }
            } else if (isSelected) {
              bg = 'rgba(59, 130, 246, 0.1)';
              border = '1px solid var(--color-brand)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={isRevealed}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: bg,
                  color: color,
                  border: border,
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: isRevealed ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isRevealed && !isCorrectOption && !isSelected ? 0.6 : 1
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
            {currentQuestion.explanation && (
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--color-brand)' }}>
                {currentQuestion.explanation}
              </p>
            )}
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--color-brand)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
