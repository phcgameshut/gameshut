"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { storage } from "@/lib/storage";

type Tier = "one-time" | "tier-1" | "tier-2" | "tier-3";
type Interval = "monthly" | "annually";

interface PlanConfig {
  name: string;
  monthly: number;
  annually: number;
  monthlyPlanCode: string;
  annuallyPlanCode: string;
}

const TIERS: Record<string, PlanConfig> = {
  "tier-1": { name: "Community Anchor", monthly: 20000, annually: 200000, monthlyPlanCode: "PLN_mr4v03o0mxggmak", annuallyPlanCode: "PLN_luo59ozwpu242vf" },
  "tier-2": { name: "The Vanguard", monthly: 30000, annually: 300000, monthlyPlanCode: "PLN_83bpd8qpnrpu3ig", annuallyPlanCode: "PLN_a3ypnqemtr2ncty" },
  "tier-3": { name: "The GamesHut Legend", monthly: 60000, annually: 700000, monthlyPlanCode: "PLN_xxy7mniy8u4k8x5", annuallyPlanCode: "PLN_4stizsdx7tfurj4" },
};

export default function PatreonPage() {
  const [selectedTier, setSelectedTier] = useState<Tier>("one-time");
  const [interval, setInterval] = useState<Interval>("monthly");
  const [customAmount, setCustomAmount] = useState<string>("5000");
  
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
      showToast("Please sign in or create an account to start a recurring subscription so you can easily manage it later.", "error");
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
      const parsedAmount = parseInt(customAmount.replace(/,/g, ""));
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
      plan: planCode || undefined, // undefined for one-time
      ref: "patreon_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
      callback: (response: any) => {
        setIsProcessing(false);
        
        // Log transaction to storage
        const currentData = storage.getPatreonTransactions ? storage.getPatreonTransactions() : [];
        const newRecord = {
          id: response.reference,
          userId: userId || "guest_" + Date.now(),
          email: userEmail,
          amount: amount,
          type: selectedTier === "one-time" ? "donation" : "subscription",
          tier: selectedTier,
          interval: selectedTier === "one-time" ? "none" : interval,
          status: "active",
          createdAt: new Date().toISOString()
        };
        
        if (storage.setPatreonTransactions) {
          storage.setPatreonTransactions([newRecord, ...currentData]);
        }
        
        showToast(`Thank you! Payment successful. Reference: ${response.reference}`, "success");
      },
      onClose: () => {
        setIsProcessing(false);
        showToast("Payment cancelled.", "error");
      }
    });

    handler.openIframe();
  };

  return (
    <div className="container" style={{ padding: "80px 20px", minHeight: "80vh", maxWidth: "800px" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, textAlign: "center", marginBottom: "10px" }}>
        You Are the Heart of <span style={{ color: "var(--color-brand)" }}>GamesHut Club ❤️🎮</span>
      </h1>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "40px", fontSize: "1.1rem", lineHeight: 1.6 }}>
        Everything we love about GamesHut exists because of you. When you back GamesHut, you aren’t just donating; you’re investing in a home away from home and keeping the vibe alive for everyone...
      </p>

      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, textAlign: "center", marginBottom: "30px", color: "var(--text-primary)" }}>
        Find the tier that speaks to your heart:
      </h2>

      {!userId && (
        <div style={{ background: "#fef3c7", padding: "16px", borderRadius: "12px", marginBottom: "30px", color: "#92400e" }}>
          <strong>Notice:</strong> You are currently a guest. You can make a <strong>One-Time Donation</strong> anonymously. To select a monthly or annual recurring tier, please <Link href="/login" style={{ textDecoration: "underline", fontWeight: "bold" }}>Sign In</Link> so you can easily manage or cancel your subscription later.
        </div>
      )}

      {/* Tiers Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        
        {/* One Time Donor */}
        <div 
          onClick={() => setSelectedTier("one-time")}
          style={{
            border: selectedTier === "one-time" ? "3px solid var(--color-brand)" : "1px solid var(--card-border)",
            borderRadius: "16px", padding: "24px", cursor: "pointer", transition: "all 0.2s",
            background: "var(--bg-primary)"
          }}
        >
          <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>The Good Samaritan (One-Time Gift)</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "12px", fontWeight: 600 }}>Flexible amount • No strings attached</p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px", lineHeight: 1.5 }}>Drop a blessing whenever you can. Every single contribution adds fuel to the engine and puts a massive smile on the entire community's face.</p>
          
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
            <span style={{ padding: "10px", background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>₦</span>
            <input 
              type="number" 
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent selecting tier when just typing
              style={{ padding: "10px", width: "100%", border: "none", outline: "none", fontSize: "1.1rem" }}
            />
          </div>
        </div>

        {/* Subscription Tiers */}
        {Object.entries(TIERS).map(([key, config]) => (
          <div 
            key={key}
            onClick={() => setSelectedTier(key as Tier)}
            style={{
              border: selectedTier === key ? "3px solid var(--color-brand)" : "1px solid var(--card-border)",
              borderRadius: "16px", padding: "24px", cursor: "pointer", transition: "all 0.2s",
              background: "var(--bg-primary)", position: "relative"
            }}
          >
            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>{config.name}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>Automated recurring support.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input 
                  type="radio" 
                  name={`interval-${key}`} 
                  checked={selectedTier === key && interval === "monthly"}
                  onChange={() => { setSelectedTier(key as Tier); setInterval("monthly"); }}
                />
                <span style={{ fontWeight: 600 }}>₦{config.monthly.toLocaleString()}/month</span>
              </label>
              
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input 
                  type="radio" 
                  name={`interval-${key}`} 
                  checked={selectedTier === key && interval === "annually"}
                  onChange={() => { setSelectedTier(key as Tier); setInterval("annually"); }}
                />
                <span style={{ fontWeight: 600 }}>₦{config.annually.toLocaleString()}/year</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Form */}
      <div style={{ background: "var(--bg-secondary)", padding: "30px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>Complete Your Support</h3>
        
        {!userId && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" 
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="guest@example.com"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none" }}
            />
          </div>
        )}

        <button 
          onClick={handleCheckout}
          disabled={isProcessing}
          style={{
            width: "100%", padding: "16px", borderRadius: "12px",
            background: "var(--color-brand)", color: "white",
            border: "none", fontWeight: 700, fontSize: "1.1rem",
            cursor: isProcessing ? "not-allowed" : "pointer", opacity: isProcessing ? 0.7 : 1
          }}
        >
          {isProcessing ? "Processing..." : selectedTier === "one-time" ? `Donate ₦${parseInt(customAmount || "0").toLocaleString()}` : `Subscribe to ${TIERS[selectedTier]?.name}`}
        </button>
      </div>
    </div>
  );
}
