import React, { useEffect } from 'react';

type GameRulesProps = {
  title: string;
  theme?: string;
  icon: React.ReactNode;
  instructions: React.ReactNode[];
  onStart: () => void;
  onCancel?: () => void;
  ctaText?: string;
};

export default function GameRules({ title, theme, icon, instructions, onStart, onCancel, ctaText = "Start Game" }: GameRulesProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ 
      maxWidth: "640px", 
      margin: "0 auto", 
      padding: "20px 16px", 
      width: "100%", 
      boxSizing: "border-box",
      animation: "fadeUp 0.4s ease-out"
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        .rule-item:hover {
          background: rgba(99, 102, 241, 0.04);
        }
        .start-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background-size: 200% auto;
        }
        .start-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 28px -10px rgba(99, 102, 241, 0.6);
          background-position: right center;
        }
        .start-btn:active {
          transform: translateY(1px);
        }
      `}</style>
      
      <div style={{ 
        background: "#ffffff", 
        borderRadius: "28px", 
        padding: "clamp(24px, 5vw, 40px)", 
        boxShadow: "0 20px 50px -12px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)", 
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {onCancel && (
          <button 
            onClick={onCancel}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(15, 23, 42, 0.05)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
              zIndex: 10,
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(15, 23, 42, 0.1)"; e.currentTarget.style.color = "#0f172a"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(15, 23, 42, 0.05)"; e.currentTarget.style.color = "#64748b"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}

        {/* Subtle decorative background blob */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-20%",
          width: "140%",
          height: "200px",
          background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 0,
          pointerEvents: "none"
        }}></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ 
            width: "88px", 
            height: "88px", 
            background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)", 
            borderRadius: "26px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 24px auto",
            color: "var(--color-brand)",
            boxShadow: "0 8px 16px -6px rgba(99, 102, 241, 0.2), inset 0 0 0 1px rgba(255,255,255,0.6)",
            animation: "float 4s ease-in-out infinite"
          }}>
            <div style={{ transform: "scale(1.2)" }}>
              {icon}
            </div>
          </div>
          
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, color: "#0f172a", margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>{title}</h2>
          
          {theme && (
            <div style={{ display: "inline-block", background: "rgba(99, 102, 241, 0.1)", padding: "6px 18px", borderRadius: "20px", marginBottom: "32px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
              <span style={{ color: "var(--color-brand)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1.2px" }}>Theme: {theme}</span>
            </div>
          )}
          
          <div style={{ 
            background: "#f8fafc", 
            borderRadius: "20px", 
            padding: "clamp(20px, 4vw, 28px)", 
            marginBottom: "24px", 
            textAlign: "left",
            border: "1px solid #f1f5f9"
          }}>
            <h3 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "20px", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#e0e7ff", color: "var(--color-brand)", borderRadius: "10px", width: "32px", height: "32px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </span>
              How to Play
            </h3>
            <ul style={{ 
              color: "#475569", 
              lineHeight: 1.6, 
              paddingLeft: "0", 
              margin: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}>
              {instructions.map((inst, idx) => (
                <li key={idx} className="rule-item" style={{ display: "flex", gap: "16px", alignItems: "flex-start", fontSize: "0.95rem", padding: "12px", borderRadius: "12px", transition: "background 0.2s" }}>
                  <span style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    background: "#ffffff",
                    border: "2px solid #e2e8f0", 
                    color: "#64748b", 
                    borderRadius: "50%", 
                    width: "28px", 
                    height: "28px", 
                    fontSize: "0.8rem", 
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: "2px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ paddingTop: "6px" }}>{inst}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{ 
            background: "#fef2f2", 
            border: "1px solid #fecaca", 
            borderRadius: "16px", 
            padding: "16px 20px", 
            marginBottom: "32px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            textAlign: "left"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
            <div>
              <strong style={{ color: "#b91c1c", display: "block", marginBottom: "4px", fontSize: "0.95rem" }}>Anti-Cheat Rule</strong>
              <span style={{ color: "#991b1b", fontSize: "0.9rem", lineHeight: 1.5, display: "block" }}>You cannot leave this page. If you minimize or switch tabs during the game, your session ends and scores <strong style={{ fontWeight: 800 }}>0 points</strong>.</span>
            </div>
          </div>
          
          <button 
            className="start-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onStart();
            }} 
            style={{ 
              width: "100%", 
              padding: "18px", 
              borderRadius: "18px", 
              background: "linear-gradient(to right, #4f46e5 0%, #6366f1 51%, #4f46e5 100%)", 
              color: "white", 
              border: "none", 
              fontWeight: 800, 
              fontSize: "1.15rem", 
              cursor: "pointer",
              boxShadow: "0 8px 20px -6px rgba(79, 70, 229, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              letterSpacing: "0.5px"
            }}
          >
            {ctaText}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
