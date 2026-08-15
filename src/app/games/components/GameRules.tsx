import React, { useEffect } from 'react';

type GameRulesProps = {
  title: string;
  theme?: string;
  icon: React.ReactNode;
  instructions: React.ReactNode[];
  onStart: () => void;
  ctaText?: string;
};

export default function GameRules({ title, theme, icon, instructions, onStart, ctaText = "Start Game" }: GameRulesProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ 
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", 
        borderRadius: "24px", 
        padding: "32px 24px", 
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)", 
        textAlign: "center",
        border: "1px solid rgba(226, 232, 240, 0.8)"
      }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)", 
          borderRadius: "24px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto 24px auto",
          color: "var(--accent-primary)",
          boxShadow: "inset 0 0 0 1px rgba(99, 102, 241, 0.2)"
        }}>
          {icon}
        </div>
        
        <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>{title}</h2>
        
        {theme && (
          <div style={{ display: "inline-block", background: "rgba(99, 102, 241, 0.1)", padding: "6px 16px", borderRadius: "20px", marginBottom: "24px" }}>
            <span style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Theme: {theme}</span>
          </div>
        )}
        
        <div style={{ 
          background: "#ffffff", 
          borderRadius: "16px", 
          padding: "24px", 
          marginBottom: "32px", 
          textAlign: "left",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          border: "1px solid #f1f5f9"
        }}>
          <h3 style={{ fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-brand)" }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            How to Play
          </h3>
          <ul style={{ 
            color: "var(--text-secondary)", 
            lineHeight: 1.8, 
            paddingLeft: "0", 
            margin: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {instructions.map((inst, idx) => (
              <li key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "0.95rem" }}>
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  background: "var(--bg-secondary)", 
                  color: "var(--text-secondary)", 
                  borderRadius: "50%", 
                  width: "24px", 
                  height: "24px", 
                  fontSize: "0.75rem", 
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: "2px"
                }}>
                  {idx + 1}
                </span>
                <span>{inst}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <button 
          onClick={onStart} 
          style={{ 
            width: "100%", 
            padding: "18px", 
            borderRadius: "16px", 
            background: "linear-gradient(135deg, var(--color-brand) 0%, #4f46e5 100%)", 
            color: "white", 
            border: "none", 
            fontWeight: 800, 
            fontSize: "1.1rem", 
            cursor: "pointer",
            boxShadow: "0 8px 20px -6px rgba(99, 102, 241, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 24px -8px rgba(99, 102, 241, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 8px 20px -6px rgba(99, 102, 241, 0.5)";
          }}
        >
          {ctaText}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
