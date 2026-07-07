"use client";
import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setOrg("");
    setMsg("");
  };

  return (
    <div className="container section-padding animate-fade-in" style={{ fontFamily: 'var(--font-family)' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span className="badge">Get in Touch</span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
          Let's Connect
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Have questions about strategy event packages, custom board game orders, or offsites? We're ready to assist.
        </p>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid-2" style={{ alignItems: 'start', gap: '40px' }}>
        
        {/* Left Column: Direct Channels Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="corp-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Direct Communication
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>Phone Inquiry</span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>+234 (0) 800 000 0000</span>
              </div>
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '12px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>General Email</span>
                <a href="mailto:hello@gameshut.ng" style={{ fontSize: '1.1rem', color: 'var(--color-brand)', fontWeight: 600, textDecoration: 'none' }}>
                  hello@gameshut.ng
                </a>
              </div>
            </div>
          </div>

          <div className="corp-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              Social channels
            </h3>
            
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Instagram</span>
              <a href="https://instagram.com/gameshutng" target="_blank" rel="noreferrer" style={{ fontSize: '1.1rem', color: 'var(--color-brand)', fontWeight: 600, textDecoration: 'none' }}>
                @gameshutng
              </a>
            </div>
          </div>

          <div className="corp-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Main Venue Address
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              GamesHut Arena, Block B, Suite 12, Waterfront Avenue, Lekki Phase 1, Lagos, Nigeria.
            </p>
          </div>

        </div>

        {/* Right Column: Dynamic Inquiry Form */}
        <div className="corp-card" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Submit an Inquiry
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '25px' }}>
            Send us a message and a member of our events and logistics team will reach out within 24 hours.
          </p>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem', fontWeight: 'bold' }}>
                ✓
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>Message Received!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '25px' }}>
                Thank you for reaching out. We have logged your request and will contact you shortly.
              </p>
              <button className="btn-primary" onClick={() => setSubmitted(false)} style={{ width: '100%' }}>
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Your Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Organization / Team Name (Optional)</label>
                <input 
                  type="text" 
                  value={org} 
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Message</label>
                <textarea 
                  required 
                  rows={4}
                  value={msg} 
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Tell us about your gathering or inquiry details..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                Submit Message
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
