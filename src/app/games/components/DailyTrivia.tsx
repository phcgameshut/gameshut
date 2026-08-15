"use client";

import { useState } from "react";
import { DailyChallenge } from "@/lib/storage";
import ShareResult from "./ShareResult";

interface TriviaQuestion {
  q: string;
  options: string[];
  answer: string; // The correct option exactly as a string, or index
  explanation?: string;
}

interface DailyTriviaProps {
  challenge: DailyChallenge;
  onComplete: (score: number, resultData: any) => void;
}

export default function DailyTrivia({ challenge, onComplete }: DailyTriviaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const questions: TriviaQuestion[] = challenge.content?.questions || [];
  const currentQuestion = questions[currentIndex];

  if (isGameOver) {
    return (
      <div style={{ textAlign: 'center' }}>
        <ShareResult gameType={challenge.gameTypeId} score={score} maxScore={questions.length} challengeNumber={challenge.challengeNumber} resultData={answers} />
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => onComplete(score, { answers })}>Save & Return to Hub</button>
      </div>
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
      setIsGameOver(true);
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
