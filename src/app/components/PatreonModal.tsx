"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatreonModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    // Check if the modal has been dismissed previously (snooze for 3 days)
    const snoozeUntil = localStorage.getItem("gh_patreon_snooze");
    if (snoozeUntil && Date.now() < parseInt(snoozeUntil)) return;

    const timer = setTimeout(() => {
      setShowModal(true);
    }, 120000); // 120 seconds (2 minutes)

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowModal(false);
    // Snooze for 3 days if they dismiss it
    localStorage.setItem("gh_patreon_snooze", (Date.now() + 3 * 24 * 60 * 60 * 1000).toString());
  };

  if (!showModal) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "white", padding: "30px", borderRadius: "20px",
        maxWidth: "450px", width: "100%", textAlign: "center",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        animation: "fadeIn 0.3s ease-out forwards"
      }}>
        <div style={{
          background: "#eff6ff", width: "72px", height: "72px",
          borderRadius: "50%", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 20px"
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        
        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Help Keep The Game On!
        </h3>
        
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.6, fontSize: "1.05rem" }}>
          GamesHut is a non-profit initiative dedicated to bringing you fresh, fun daily challenges. If you love playing here, consider joining the <strong>GamesHut Club</strong> to help us keep the servers running and the games coming!
        </p>
        
        <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
          <Link href="/patreon" onClick={() => setShowModal(false)} style={{ textDecoration: 'none' }}>
            <button style={{
              width: "100%", padding: "16px", borderRadius: "12px",
              background: "var(--color-brand)", color: "white",
              border: "none", fontWeight: 700, fontSize: "1.1rem",
              cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"
            }}>
              Become a Patreon
            </button>
          </Link>
          <button 
            onClick={handleDismiss}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px",
              background: "transparent", color: "var(--text-secondary)",
              border: "1px solid #e2e8f0", fontWeight: 600, fontSize: "1rem",
              cursor: "pointer"
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
