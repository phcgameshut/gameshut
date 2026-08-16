"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { storage, getEmailTemplateHtml } from "@/lib/storage";

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
  icon: React.ReactNode;
  highlight?: boolean;
}

// SVG Icons
const IconAnchor = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
  </svg>
);
const IconBolt = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCrown = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20M4 20l2-8 6 4 4-10 4 10 2-4 2 8H4z"/>
  </svg>
);
const IconHeart = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const TIERS: Record<string, PlanConfig> = {
  "tier-1": {
    name: "Community Anchor",
    shortName: "Community Anchor",
    description: "You're the glue that holds this community together.",
    perks: ["Free access to all our events", "Early access to new games", "Shoutout in our newsletter"],
    monthly: 20000,
    annually: 200000,
    monthlyPlanCode: "PLN_mr4v03o0mxggmak",
    annuallyPlanCode: "PLN_luo59ozwpu242vf",
    icon: <IconAnchor />,
  },
  "tier-2": {
    name: "Vanguard",
    shortName: "Vanguard",
    description: "You're leading the charge. The community sees you.",
    perks: ["Free access to all our events", "Early access to new games", "Priority support", "Vote on new features"],
    monthly: 30000,
    annually: 300000,
    monthlyPlanCode: "PLN_83bpd8qpnrpu3ig",
    annuallyPlanCode: "PLN_a3ypnqemtr2ncty",
    icon: <IconBolt />,
    highlight: true,
  },
  "tier-3": {
    name: "GamesHut Legend",
    shortName: "GamesHut Legend",
    description: "You ARE GamesHut. Legends don't just play — they build legacies.",
    perks: ["Free access to all our events", "Name in Hall of Fame", "1-on-1 with the GamesHut team", "Custom profile frame", "Lifetime recognition"],
    monthly: 60000,
    annually: 700000,
    monthlyPlanCode: "PLN_xxy7mniy8u4k8x5",
    annuallyPlanCode: "PLN_4stizsdx7tfurj4",
    icon: <IconCrown />,
  },
};

export default function PatreonPage() {
  const [selectedTier, setSelectedTier] = useState<Tier>("one-time");
  const [interval, setInterval] = useState<Interval>("monthly");
  const [customAmount, setCustomAmount] = useState<string>("");

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{ reference: string, amount: number, isSubscription: boolean, tierName: string } | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("gh_session_user_id");
    if (id && !id.startsWith("guest")) {
      setUserId(id);
      const players = storage.getPlayers();
      const me = players.find(p => p.id === id);
      if (me) {
        setUserEmail(me.email || "");
        setUserName(me.name || "");
      }
    }
  }, []);

  const loadPaystack = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).PaystackPop) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!userEmail || !userName) {
      showToast("Please provide your name and email address.", "error");
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
      amount: amount * 100,
      currency: "NGN",
      plan: planCode || undefined,
      ref: "PAT" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      callback: (response: any) => {
        setIsProcessing(false);
        const currentData = storage.getPatreonTransactions ? storage.getPatreonTransactions() : [];
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

        // Send beautiful thank-you email
        const tierNames: Record<string, string> = {
          "tier-1": "Community Anchor",
          "tier-2": "Vanguard",
          "tier-3": "GamesHut Legend",
          "one-time": "Good Samaritan",
        };
        const tierName = tierNames[selectedTier] || selectedTier;
        const isSubscription = selectedTier !== "one-time";
        const donorName = userName || (storage.getPlayers().find(p => p.email === userEmail)?.name) || userEmail.split("@")[0];

        const userEmailHtml = getEmailTemplateHtml(
          isSubscription ? `Welcome to the ${tierName} tier!` : "Thank you for your donation!",
          isSubscription ? `You're now a ${tierName}!` : "Thank you for your kindness!",
          isSubscription 
            ? `<p>Welcome to the family, <strong>${donorName}</strong>. Your support as a <strong>${tierName}</strong> keeps the lights on and the vibes alive for everyone in the GamesHut community.</p>
               <div style="background:#f1f5f9; border-radius:10px; padding:20px; margin-top:20px; border:1px solid #e2e8f0;">
                 <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="color:#64748b;">Amount:</span> <strong>₦${amount.toLocaleString()}</strong></div>
                 <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="color:#64748b;">Tier:</span> <strong>${tierName}</strong></div>
                 <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="color:#64748b;">Billing:</span> <strong>${interval === "monthly" ? "Monthly" : "Annual"}</strong></div>
                 <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Reference:</span> <span style="font-family:monospace;">${response.reference}</span></div>
               </div>`
            : `<p><strong>${donorName}</strong>, your one-time gift of <strong>₦${amount.toLocaleString()}</strong> means the world to us. Every naira goes straight into building a better community for everyone.</p>
               <div style="background:#f1f5f9; border-radius:10px; padding:20px; margin-top:20px; border:1px solid #e2e8f0;">
                 <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="color:#64748b;">Amount:</span> <strong>₦${amount.toLocaleString()}</strong></div>
                 <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span style="color:#64748b;">Tier:</span> <strong>${tierName}</strong></div>
                 <div style="display:flex; justify-content:space-between;"><span style="color:#64748b;">Reference:</span> <span style="font-family:monospace;">${response.reference}</span></div>
               </div>`,
          `<a href="https://gameshut.ng" style="display:inline-block; background-color:#3B5CEB; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">Visit GamesHut</a>`
        );

        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: userEmail,
            name: donorName,
            subject: isSubscription
              ? `Welcome to the ${tierName} tier, ${donorName}!`
              : `Thank you for your donation, ${donorName}!`,
            html: userEmailHtml,
          }),
        }).catch(() => {}); // fire-and-forget

        const adminEmailHtml = getEmailTemplateHtml(
          "New Donation Received",
          "New Donation Alert",
          `<p>A new ${isSubscription ? "subscription" : "one-time donation"} has just been processed successfully.</p>
           <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-top:20px;">
             <tr><td style="color:#64748b; width:40%;">Name:</td><td><strong>${donorName}</strong></td></tr>
             <tr><td style="color:#64748b;">Email:</td><td><strong>${userEmail}</strong></td></tr>
             <tr><td style="color:#64748b;">Phone:</td><td><strong>${userPhone || "Not provided"}</strong></td></tr>
             <tr><td style="color:#64748b;">Type:</td><td><strong>${isSubscription ? "Subscription" : "One-Time"}</strong></td></tr>
             <tr><td style="color:#64748b;">Tier:</td><td><strong>${tierName}</strong></td></tr>
             <tr><td style="color:#64748b;">Amount:</td><td><strong>₦${amount.toLocaleString()}</strong></td></tr>
             <tr><td style="color:#64748b;">Reference:</td><td style="font-family:monospace;">${response.reference}</td></tr>
           </table>`,
          `<a href="https://gameshut.ng/admin" style="display:inline-block; background-color:#0f172a; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px;">Open Admin Dashboard</a>`
        );

        // Send notification email to admin
        fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: "phcgameshut@gmail.com",
            name: "GamesHut Admin",
            subject: `New Donation: ₦${amount.toLocaleString()} from ${donorName}`,
            html: adminEmailHtml
          })
        }).catch(() => {});

        setPaymentSuccess({
          reference: response.reference,
          amount,
          isSubscription,
          tierName
        });
        showToast("Payment successful!", "success");
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
  const guestBlockedSubscription = !userId && selectedTier !== "one-time";

  if (paymentSuccess) {
    return (
      <main style={{ padding: "80px 20px", maxWidth: "600px", margin: "0 auto", textAlign: "center", minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "var(--color-brand)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 30px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "15px", letterSpacing: "-0.5px" }}>
          Thank you!
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "40px" }}>
          Your {paymentSuccess.isSubscription ? "subscription" : "donation"} of <strong>₦{paymentSuccess.amount.toLocaleString()}</strong> has been received. 
          {paymentSuccess.isSubscription && ` You are now a proud ${paymentSuccess.tierName}.`}
          <br/><br/>
          An email receipt has been sent to <strong>{userEmail}</strong>.
        </p>
        
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", borderRadius: "16px", padding: "24px", marginBottom: "40px", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--card-border)", paddingBottom: "15px", marginBottom: "15px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Amount Paid</span>
            <strong style={{ color: "var(--text-primary)" }}>₦{paymentSuccess.amount.toLocaleString()}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--card-border)", paddingBottom: "15px", marginBottom: "15px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Support Tier</span>
            <strong style={{ color: "var(--text-primary)" }}>{paymentSuccess.tierName}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Transaction Ref</span>
            <span style={{ color: "var(--text-primary)", fontFamily: "monospace", fontSize: "0.9rem" }}>{paymentSuccess.reference}</span>
          </div>
        </div>

        <Link href="/" style={{ display: "inline-block", background: "var(--color-brand)", color: "white", padding: "16px 32px", borderRadius: "12px", fontWeight: 800, textDecoration: "none" }}>
          Return Home
        </Link>
      </main>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .patreon-page { min-height: 100vh; background: var(--bg-primary); }

        .patreon-hero {
          padding: 72px 24px 48px;
          text-align: center;
          max-width: 680px;
          margin: 0 auto;
        }
        .patreon-hero .sub-heading {
          font-size: 0.85rem;
          color: var(--color-brand);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .patreon-hero h1 {
          font-size: clamp(1.9rem, 4.5vw, 2.8rem);
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 20px;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }
        .patreon-hero h1 span { color: var(--color-brand); }
        .patreon-hero > p {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 540px;
          margin: 0 auto 40px;
        }

        /* --- BIG INTERVAL TOGGLE --- */
        .interval-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 52px;
        }
        .interval-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
        }
        .interval-toggle {
          display: inline-flex;
          background: var(--bg-secondary);
          border-radius: 100px;
          padding: 5px;
          gap: 4px;
          border: 2px solid var(--card-border);
        }
        .interval-btn {
          padding: 12px 32px;
          border-radius: 100px;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .interval-btn.active {
          background: var(--color-brand);
          color: white;
          box-shadow: 0 4px 16px rgba(59, 92, 235, 0.35);
        }
        .save-pill {
          font-size: 0.68rem;
          font-weight: 800;
          background: #dcfce7;
          color: #166534;
          padding: 2px 8px;
          border-radius: 100px;
          letter-spacing: 0.04em;
        }
        .interval-btn.active .save-pill {
          background: rgba(255,255,255,0.25);
          color: white;
        }

        /* Guest notice */
        .guest-notice {
          max-width: 920px;
          margin: 0 auto 28px;
          padding: 14px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          color: var(--text-secondary);
          font-size: 0.88rem;
          line-height: 1.6;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .guest-notice a { color: var(--color-brand); font-weight: 700; text-decoration: none; }
        .guest-notice a:hover { text-decoration: underline; }

        /* Tiers grid */
        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 18px;
          max-width: 980px;
          margin: 0 auto 44px;
          padding: 0 24px;
        }

        .tier-card {
          border-radius: 20px;
          padding: 26px 22px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--bg-primary);
          border: 2px solid var(--card-border);
          position: relative;
          overflow: hidden;
        }
        .tier-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .tier-card.selected {
          border-color: var(--color-brand);
          box-shadow: 0 0 0 4px rgba(59, 92, 235, 0.12), 0 16px 32px rgba(59,92,235,0.1);
        }
        .tier-card.highlighted {
          /* Distinguished only by the "Most Popular" badge, not a permanent border */
        }
        .tier-card.highlighted.selected {
          box-shadow: 0 0 0 4px rgba(59, 92, 235, 0.25), 0 20px 40px rgba(59,92,235,0.12);
        }
        /* Guest-locked subscription cards */
        .tier-card.guest-locked {
          cursor: default;
          opacity: 0.75;
        }
        .tier-card.guest-locked:hover { transform: none; box-shadow: none; }

        .popular-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--color-brand);
          color: white;
          padding: 3px 9px;
          border-radius: 100px;
        }
        .tier-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          border: 1px solid var(--card-border);
        }
        .tier-name {
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 5px;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .tier-desc {
          font-size: 0.83rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 18px;
        }
        .tier-price {
          font-size: 1.65rem;
          font-weight: 900;
          color: var(--color-brand);
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .tier-price-label {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-bottom: 18px;
        }
        .tier-perks { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 7px; }
        .tier-perk {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.4;
        }
        .perk-check {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          margin-top: 1px;
          color: #22c55e;
        }

        /* One-time amount input */
        .amount-input-wrap {
          display: flex;
          align-items: center;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid var(--card-border);
          margin-top: 14px;
          transition: border-color 0.2s;
        }
        .amount-input-wrap:focus-within { border-color: var(--color-brand); }
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

        /* Checkout */
        .checkout-section { max-width: 540px; margin: 0 auto 80px; padding: 0 24px; }
        .checkout-box {
          background: var(--bg-secondary);
          border-radius: 20px;
          padding: 30px;
          border: 1px solid var(--card-border);
        }
        .checkout-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          background: var(--bg-primary);
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid var(--card-border);
        }
        .checkout-summary-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; }
        .checkout-summary-value { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
        .email-field { margin-bottom: 20px; }
        .email-field label {
          display: block;
          font-size: 0.8rem;
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
        .email-field input:focus { border-color: var(--color-brand); }

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
        .checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Signup CTA (guest blocked) */
        .signup-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background: var(--bg-primary);
          border-radius: 14px;
          border: 2px dashed var(--card-border);
          text-align: center;
        }
        .signup-cta p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
        .signup-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: var(--color-brand);
          color: white;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.2s;
        }
        .signup-cta-btn:hover {
          background: var(--accent-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,92,235,0.3);
        }

        .secure-note {
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      `}} />

      <div className="patreon-page">
        {/* Hero */}
        <div className="patreon-hero">
          <p className="sub-heading">Support GamesHut</p>
          <h1>
            You Are the Heart of <span>GamesHut Club</span>
          </h1>
          <p>
            Everything we love about GamesHut exists because of you. When you back GamesHut, you aren&apos;t just donating — you&apos;re investing in a home away from home and keeping the vibe alive for everyone.
          </p>

          {/* Always-visible interval toggle */}
          <div className="interval-wrap">
            <span className="interval-label">Choose billing period</span>
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
                <span className="save-pill">Save 17%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guest notice */}
        {!userId && (
          <div className="guest-notice">
            <IconUser />
            <span>
              Only one-time donations are allowed when you are <strong style={{ color: "var(--text-primary)" }}>NOT signed in</strong>.{" "}
              <Link href="/login" style={{ color: "var(--color-brand)", fontWeight: 800, textDecoration: "underline", textDecorationColor: "var(--color-brand)" }}>
                SIGN IN IS REQUIRED
              </Link>{" "}to subscribe to recurring tiers and manage your donations.
            </span>
          </div>
        )}

        {/* Tiers */}
        <div className="tiers-grid">
          {/* One-time */}
          <div
            className={`tier-card ${selectedTier === "one-time" ? "selected" : ""}`}
            onClick={() => setSelectedTier("one-time")}
          >
            <div className="tier-icon"><IconHeart /></div>
            <div className="tier-name">Good Samaritan</div>
            <div className="tier-desc">Flexible amount · No strings attached</div>
            <div className="tier-price" style={{ fontSize: "1.1rem", marginBottom: 4 }}>One-Time Gift</div>
            <p className="tier-desc" style={{ marginBottom: 0 }}>Drop a blessing whenever you can. Every contribution puts a massive smile on the community&apos;s face.</p>

            <div className="amount-input-wrap" onClick={e => e.stopPropagation()}>
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
            const locked = !userId; // guests can't subscribe
            return (
              <div
                key={key}
                className={`tier-card ${isSelected ? "selected" : ""} ${config.highlight ? "highlighted" : ""} ${locked ? "guest-locked" : ""}`}
                onClick={() => { if (!locked) setSelectedTier(key as Tier); }}
              >
                {config.highlight && <span className="popular-badge">Most Popular</span>}
                <div className="tier-icon">{config.icon}</div>
                <div className="tier-name">{config.name}</div>
                <div className="tier-desc">{config.description}</div>
                <div className="tier-price">₦{price.toLocaleString()}</div>
                <div className="tier-price-label">per {interval === "monthly" ? "month" : "year"}</div>
                <ul className="tier-perks">
                  {config.perks.map((perk, i) => (
                    <li key={i} className="tier-perk">
                      <svg className="perk-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
                {locked && (
                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                    <IconLock />
                    <Link href="/login" style={{ color: "var(--color-brand)", textDecoration: "none", fontWeight: 700 }} onClick={e => e.stopPropagation()}>Sign in to unlock</Link>
                  </div>
                )}
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

            {guestBlockedSubscription ? (
              <div className="signup-cta">
                <p>Create a free GamesHut account to start your <strong>{selectedTierConfig?.name}</strong> subscription and manage it any time.</p>
                <Link href="/login" className="signup-cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Sign in / Create Account
                </Link>
              </div>
            ) : (
              <>
                <div className="email-field">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="email-field">
                  <label>Your Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="email-field">
                  <label>Your Phone (Optional)</label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={e => setUserPhone(e.target.value)}
                    placeholder="08012345678"
                  />
                </div>
                <button className="checkout-btn" onClick={handleCheckout} disabled={isProcessing}>
                  {getButtonLabel()}
                </button>
                <p className="secure-note">
                  <IconLock /> Secured by Paystack · Cancel anytime
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
