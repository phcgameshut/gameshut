"use client";
import { useState } from "react";
import { showToast } from "@/lib/toast";

export default function ClaimPassPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimedTicket, setClaimedTicket] = useState<{
    id: string;
    buyerName: string;
    buyerEmail: string;
    eventTitle: string;
    date: string;
    time: string;
    location: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast("Please fill in your name, email, and phone number.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/claim-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to claim ticket pass");
      }

      setClaimedTicket(data.ticket);
      showToast("🎉 Free Student Ticket Claimed! Check your email inbox.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to claim ticket pass", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      {!claimedTicket ? (
        <div className="corp-card" style={{ padding: "35px 25px", borderRadius: "24px" }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <span style={{ 
              background: "rgba(59, 92, 235, 0.1)", 
              color: "var(--color-brand)", 
              fontWeight: 800, 
              fontSize: "0.8rem", 
              padding: "6px 14px", 
              borderRadius: "20px",
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              🎓 Student VIP Access
            </span>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-primary)", marginTop: "12px", marginBottom: "8px" }}>
              Claim Your Free Ticket Pass
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Exclusive invitation for students. Enter your details below to claim your complimentary pass to the <strong>GamesHut Tetris Party</strong>!
            </p>
          </div>

          <div style={{ 
            background: "#f8fafc", 
            border: "1px solid var(--card-border)", 
            borderRadius: "14px", 
            padding: "16px", 
            marginBottom: "25px" 
          }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>📍 Event Details</h4>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div><strong>Event:</strong> GamesHut Tetris Party</div>
              <div><strong>Date & Time:</strong> Saturday, Sept 26, 2026 @ 4:00 PM</div>
              <div><strong>Venue:</strong> Praia Lagos, Victoria Island</div>
              <div><strong>Access:</strong> Free Student Entry Pass</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oluwatobi Adeleke"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--card-stroke)",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@gmail.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--card-stroke)",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                WhatsApp / Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08123456789"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--card-stroke)",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                fontWeight: 800,
                borderRadius: "12px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                marginTop: "10px"
              }}
            >
              {isSubmitting ? "Claiming Ticket Pass..." : "🎟️ Claim My Free Ticket Pass →"}
            </button>
          </form>
          
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", marginTop: "16px" }}>
            * Note: Present your Student ID alongside your email ticket pass at entry.
          </p>
        </div>
      ) : (
        <div className="corp-card" style={{ padding: "35px 25px", borderRadius: "24px", textAlign: "center" }}>
          <span style={{ fontSize: "3rem" }}>🎉</span>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", marginTop: "10px", marginBottom: "6px" }}>
            Ticket Claimed Successfully!
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
            We've sent your official ticket pass directly to <strong>{claimedTicket.buyerEmail}</strong>.
          </p>

          <div style={{
            background: "#ffffff",
            border: "2px solid var(--color-brand)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            textAlign: "left"
          }}>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <span style={{ 
                fontFamily: "monospace", 
                fontSize: "1.4rem", 
                fontWeight: 900, 
                color: "var(--color-brand)",
                background: "rgba(59, 92, 235, 0.08)",
                padding: "6px 16px",
                borderRadius: "8px"
              }}>
                {claimedTicket.id}
              </span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div><strong>Name:</strong> {claimedTicket.buyerName}</div>
              <div><strong>Event:</strong> {claimedTicket.eventTitle}</div>
              <div><strong>Date & Time:</strong> {claimedTicket.date} @ {claimedTicket.time}</div>
              <div><strong>Venue:</strong> {claimedTicket.location}</div>
            </div>
          </div>

          <button
            onClick={() => setClaimedTicket(null)}
            className="btn-secondary"
            style={{ width: "100%", padding: "12px", borderRadius: "10px", fontWeight: 700 }}
          >
            Claim Another Pass for a Friend
          </button>
        </div>
      )}
    </div>
  );
}
