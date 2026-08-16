"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { storage } from "@/lib/storage";

type Tier = "one-time" | "tier-1" | "tier-2" | "tier-3";
type Interval = "monthly" | "annually";

interface PlanConfig {
  name: string;
  shortName: string;
  description: string;
  perks: string[];
  monthly: number;
  annually: number;
  monthlyPlanCode: string;
  annuallyPlanCode: string;
  emoji: string;
  highlight?: boolean;
}

const TIERS: Record<string, PlanConfig> = {
  "tier-1": {
    name: "Community Anchor",
    shortName: "Community Anchor",
    description: "You're the glue that holds this community together.",
    perks: ["Supporter badge on profile", "Early access to new games", "Shoutout in our newsletter"],
    monthly: 20000,
    annually: 200000,
    monthlyPlanCode: "PLN_mr4v03o0mxggmak",
    annuallyPlanCode: "PLN_luo59ozwpu242vf",
    emoji: "⚓",
  },
  "tier-2": {
    name: "Vanguard",
    shortName: "Vanguard",
    description: "You're leading the charge. The community sees you.",
    perks: ["All Community Anchor perks", "Priority support", "Exclusive Vanguard Discord channel", "Vote on new features"],
    monthly: 30000,
    annually: 300000,
    monthlyPlanCode: "PLN_83bpd8qpnrpu3ig",
    annuallyPlanCode: "PLN_a3ypnqemtr2ncty",
    emoji: "⚡",
    highlight: true,
  },
  "tier-3": {
    name: "GamesHut Legend",
    shortName: "GamesHut Legend",
    description: "You ARE GamesHut. Legends don't just play — they build legacies.",
    perks: ["All Vanguard perks", "Name in Hall of Fame", "1-on-1 with the GamesHut team", "Custom profile frame", "Lifetime recognition"],
    monthly: 60000,
    annually: 700000,
    monthlyPlanCode: "PLN_xxy7mniy8u4k8x5",
    annuallyPlanCode: "PLN_4stizsdx7tfurj4",
    emoji: "👑",
  },
};

export default function PatreonPage() {
  const [selectedTier, setSelectedTier] = useState<Tier>("one-time");
  const [interval, setInterval] = useState<Interval>("monthly");
  const [customAmount, setCustomAmount] = useState<string>("");

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("gh_session_user_id");
    if (id && !id.startsWith("guest")) {
      setUserId(id);
      const players = storage.getPlayers();
      const me = players.find(p => p.id === id);
      if (me) setUserEmail(me.email || "");
    }
  }, []);

  const loadPaystack = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).PaystackPop) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (selectedTier !== "one-time" && !userId) {
      showToast("Please sign in to start a recurring subscription so you can manage or cancel it later.", "error");
      return;
    }

    if (!userEmail) {
      showToast("An email address is required to process payment.", "error");
      return;
    }

    setIsProcessing(true);
    const loaded = await loadPaystack();
    if (!loaded) {
      showToast("Failed to load payment gateway.", "error");
      setIsProcessing(false);
      return;
    }

    let amount = 0;
    let planCode = "";

    if (selectedTier === "one-time") {
      // Use the exact amount the user typed, not the tier amount
      const raw = customAmount.replace(/[^0-9]/g, "");
      const parsedAmount = parseInt(raw, 10);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showToast("Please enter a valid donation amount.", "error");
        setIsProcessing(false);
        return;
      }
      amount = parsedAmount;
    } else {
      const config = TIERS[selectedTier];
      amount = interval === "monthly" ? config.monthly : config.annually;
      planCode = interval === "monthly" ? config.monthlyPlanCode : config.annuallyPlanCode;
    }

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_live_2a9701ed926457f947c7e08497c3a96a6a525b02",
      email: userEmail,
      amount: amount * 100, // kobo
      currency: "NGN",
      plan: planCode || undefined,
      ref: "patreon_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
      callback: (response: any) => {
        setIsProcessing(false);

        const currentData = storage.getPatreonTransactions ? storage.getPatreonTransactions() : [];
        const tierName = selectedTier === "one-time" ? "one-time" : TIERS[selectedTier]?.shortName || selectedTier;
        const newRecord = {
          id: response.reference,
          userId: userId || "guest_" + Date.now(),
          email: userEmail,
          amount: amount,
          type: (selectedTier === "one-time" ? "donation" : "subscription") as "donation" | "subscription",
          tier: selectedTier as Tier,
          interval: selectedTier === "one-time" ? "none" : interval,
          status: "active" as const,
          createdAt: new Date().toISOString(),
        };

        if (storage.setPatreonTransactions) {
          storage.setPatreonTransactions([newRecord, ...currentData]);
        }

        showToast(`Thank you! Payment successful. Reference: ${response.reference}`, "success");
      },
      onClose: () => {
        setIsProcessing(false);
        showToast("Payment cancelled.", "error");
      },
    });

    handler.openIframe();
  };

  const getButtonLabel = () => {
    if (isProcessing) return "Processing...";
    if (selectedTier === "one-time") {
      const raw = customAmount.replace(/[^0-9]/g, "");
      const n = parseInt(raw, 10);
      return `Donate ₦${isNaN(n) || n <= 0 ? "..." : n.toLocaleString()}`;
    }
    return `Become a ${TIERS[selectedTier]?.shortName}`;
  };

  const selectedTierConfig = selectedTier !== "one-time" ? TIERS[selectedTier] : null;

  return (
    <>
      <style>{`
        .patreon-page {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* Hero */
        .patreon-hero {
          padding: 80px 24px 60px;
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }
        .patreon-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 20px;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }
        .patreon-hero h1 span {
          color: var(--color-brand);
        }
        .patreon-hero p {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto 16px;
        }
        .patreon-hero .sub-heading {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        /* Interval toggle */
        .interval-toggle {
          display: inline-flex;
          background: var(--bg-secondary);
          border-radius: 100px;
          padding: 4px;
          gap: 2px;
          margin-bottom: 48px;
          border: 1px solid var(--card-border);
        }
        .interval-btn {
          padding: 8px 22px;
          border-radius: 100px;
          border: none;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: var(--text-secondary);
        }
        .interval-btn.active {
          background: var(--color-brand);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 92, 235, 0.3);
        }

        /* Guest notice */
        .guest-notice {
          max-width: 700px;
          margin: 0 auto 32px;
          padding: 16px 20px;
          background: #fff8e1;
          border-left: 4px solid #f59e0b;
          border-radius: 10px;
          color: #78350f;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .guest-notice a { color: var(--color-brand); font-weight: 700; }

        /* Tiers grid */
        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          max-width: 1000px;
          margin: 0 auto 48px;
          padding: 0 24px;
        }

        .tier-card {
          border-radius: 20px;
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--bg-primary);
          border: 2px solid var(--card-border);
          position: relative;
          overflow: hidden;
        }
        .tier-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .tier-card.selected {
          border-color: var(--color-brand);
          box-shadow: 0 0 0 4px rgba(59, 92, 235, 0.12), 0 20px 40px rgba(59,92,235,0.1);
        }
        .tier-card.highlighted {
          background: var(--color-brand);
          border-color: var(--color-brand);
          color: white;
        }
        .tier-card.highlighted.selected {
          box-shadow: 0 0 0 4px rgba(59, 92, 235, 0.25), 0 20px 40px rgba(59,92,235,0.2);
        }
        .tier-card.highlighted p,
        .tier-card.highlighted .tier-perk,
        .tier-card.highlighted .tier-price-label {
          color: rgba(255,255,255,0.85) !important;
        }
        .tier-card.highlighted .tier-price {
          color: white !important;
        }
        .tier-card.highlighted .popular-badge {
          background: white;
          color: var(--color-brand);
        }

        .popular-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--color-brand);
          color: white;
          padding: 4px 10px;
          border-radius: 100px;
        }

        .tier-emoji {
          font-size: 2rem;
          margin-bottom: 12px;
          display: block;
        }
        .tier-name {
          font-size: 1.2rem;
          font-weight: 800;
          margin-bottom: 6px;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .tier-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .tier-price {
          font-size: 1.7rem;
          font-weight: 900;
          color: var(--color-brand);
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .tier-price-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }
        .tier-perks {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tier-perk {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.4;
        }
        .tier-perk::before {
          content: "✓";
          color: #22c55e;
          font-weight: 900;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .tier-card.highlighted .tier-perk::before {
          color: #86efac;
        }

        /* One-time card extras */
        .amount-input-wrap {
          display: flex;
          align-items: center;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid var(--card-border);
          margin-top: 16px;
          transition: border-color 0.2s;
        }
        .amount-input-wrap:focus-within {
          border-color: var(--color-brand);
        }
        .amount-prefix {
          padding: 13px 14px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 1rem;
          border-right: 2px solid var(--card-border);
        }
        .amount-input {
          padding: 13px 14px;
          width: 100%;
          border: none;
          outline: none;
          font-size: 1.1rem;
          font-weight: 700;
          background: transparent;
          color: var(--text-primary);
        }

        /* Checkout section */
        .checkout-section {
          max-width: 560px;
          margin: 0 auto 80px;
          padding: 0 24px;
        }
        .checkout-box {
          background: var(--bg-secondary);
          border-radius: 20px;
          padding: 32px;
          border: 1px solid var(--card-border);
        }
        .checkout-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--bg-primary);
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid var(--card-border);
        }
        .checkout-summary-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .checkout-summary-value {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .email-field {
          margin-bottom: 20px;
        }
        .email-field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .email-field input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 2px solid var(--card-border);
          outline: none;
          font-size: 1rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .email-field input:focus {
          border-color: var(--color-brand);
        }
        .checkout-btn {
          width: 100%;
          padding: 17px;
          border-radius: 14px;
          background: var(--color-brand);
          color: white;
          border: none;
          font-weight: 800;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: -0.01em;
        }
        .checkout-btn:hover:not(:disabled) {
          background: var(--accent-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 92, 235, 0.35);
        }
        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .secure-note {
          text-align: center;
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      `}</style>

      <div className="patreon-page">
        {/* Hero */}
        <div className="patreon-hero">
          <p className="sub-heading">Support GamesHut</p>
          <h1>
            You Are the Heart of <span>GamesHut Club ❤️🎮</span>
          </h1>
          <p>
            Everything we love about GamesHut exists because of you. When you back GamesHut, you aren&apos;t just donating — you&apos;re investing in a home away from home and keeping the vibe alive for everyone.
          </p>

          {/* Interval toggle — only show when a subscription tier is selected */}
          {selectedTier !== "one-time" && (
            <div className="interval-toggle">
              <button
                className={`interval-btn ${interval === "monthly" ? "active" : ""}`}
                onClick={() => setInterval("monthly")}
              >
                Monthly
              </button>
              <button
                className={`interval-btn ${interval === "annually" ? "active" : ""}`}
                onClick={() => setInterval("annually")}
              >
                Annually
                <span style={{ marginLeft: 6, fontSize: "0.7rem", opacity: 0.8 }}>Save ~17%</span>
              </button>
            </div>
          )}
          {selectedTier === "one-time" && <div style={{ marginBottom: 48 }} />}
        </div>

        {/* Guest notice */}
        {!userId && (
          <div className="guest-notice" style={{ maxWidth: 960, padding: "16px 24px" }}>
            <strong>Guest Mode:</strong> You can make a one-time donation anonymously. To start a recurring subscription and manage or cancel it later,{" "}
            <Link href="/login">sign in or create an account →</Link>
          </div>
        )}

        {/* Tiers */}
        <div className="tiers-grid">
          {/* One-time */}
          <div
            className={`tier-card ${selectedTier === "one-time" ? "selected" : ""}`}
            onClick={() => setSelectedTier("one-time")}
          >
            <span className="tier-emoji">🙏</span>
            <div className="tier-name">Good Samaritan</div>
            <div className="tier-desc">Flexible amount • No strings attached</div>
            <div className="tier-price" style={{ fontSize: "1.1rem", marginBottom: 4 }}>One-Time Gift</div>
            <p className="tier-desc">Drop a blessing whenever you can. Every single contribution adds fuel to the engine and puts a massive smile on the community's face.</p>

            <div
              className="amount-input-wrap"
              onClick={e => e.stopPropagation()}
            >
              <span className="amount-prefix">₦</span>
              <input
                className="amount-input"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                min="1"
              />
            </div>
          </div>

          {/* Subscription tiers */}
          {Object.entries(TIERS).map(([key, config]) => {
            const isSelected = selectedTier === key;
            const price = interval === "monthly" ? config.monthly : config.annually;
            return (
              <div
                key={key}
                className={`tier-card ${isSelected ? "selected" : ""} ${config.highlight ? "highlighted" : ""}`}
                onClick={() => setSelectedTier(key as Tier)}
              >
                {config.highlight && <span className="popular-badge">Most Popular</span>}
                <span className="tier-emoji">{config.emoji}</span>
                <div className="tier-name" style={{ color: config.highlight ? "white" : undefined }}>{config.name}</div>
                <div className="tier-desc">{config.description}</div>
                <div className="tier-price">₦{price.toLocaleString()}</div>
                <div className="tier-price-label">per {interval === "monthly" ? "month" : "year"}</div>
                <ul className="tier-perks">
                  {config.perks.map((perk, i) => (
                    <li key={i} className="tier-perk">{perk}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Checkout */}
        <div className="checkout-section">
          <div className="checkout-box">
            <div className="checkout-summary">
              <span className="checkout-summary-label">
                {selectedTier === "one-time" ? "One-Time Donation" : `${selectedTierConfig?.name} · ${interval === "monthly" ? "Monthly" : "Annual"}`}
              </span>
              <span className="checkout-summary-value">
                {selectedTier === "one-time"
                  ? `₦${parseInt(customAmount.replace(/[^0-9]/g, "") || "0").toLocaleString()}`
                  : `₦${(interval === "monthly" ? selectedTierConfig?.monthly : selectedTierConfig?.annually)?.toLocaleString()}`
                }
              </span>
            </div>

            {!userId && (
              <div className="email-field">
                <label>Your Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            )}

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {getButtonLabel()}
            </button>

            <p className="secure-note">
              🔒 Secured by Paystack · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
