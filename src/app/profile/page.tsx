"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage, Team, Player, Application, Ticket, GameEvent, AppNotification, EmailLog, WithdrawalRequest } from "@/lib/storage";
import Link from "next/link";
import { getPlayerAvatarSVG } from "../login/page";

const getTeamLogoSVG = (logoKey: string, size = 20) => {
  if (logoKey === "shield") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (logoKey === "crown") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#eab308" }}>
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        <path d="M3 20h18" />
      </svg>
    );
  }
  if (logoKey === "target") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ef4444" }}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
};

const getBadgeSVG = (badgeType: string, size = 18) => {
  if (badgeType === "captain") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#eab308" }}>
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      </svg>
    );
  }
  if (badgeType === "free_agent") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
};

const getTicketIcon = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#16a34a", display: "inline-block" }}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
  </svg>
);

const DEMO_PLAYER: Player = {
  id: "demo_user",
  name: "Alex R. 'ShadowHawk'",
  username: "shadowhawk",
  email: "alex.shadowhawk@gameshut.gg",
  password: "password123",
  role: "player",
  teamId: null,
  points: 65,
  walletId: "GSH-1849-3829",
  cashWalletBalance: 5000,
  voucherWalletBalance: 10000,
  transactions: [
    { id: "tx_1", amount: -500, description: "Tournament Entry - Apex Legends", date: "2026-07-04" },
    { id: "tx_2", amount: -1500, description: "Store Purchase - Premium Skin Pack", date: "2026-07-03" },
    { id: "tx_3", amount: 2500, description: "Tournament Prize - COD Mobile 1st Place", date: "2026-07-02" },
    { id: "tx_4", amount: 100, description: "Monthly Reward Credit Payout", date: "2026-07-01" },
  ]
};

export default function Profile() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auth States
  const [currentUser, setCurrentUser] = useState<Player>(DEMO_PLAYER);
  const [isDemo, setIsDemo] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Bank Withdrawal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawBankName, setWithdrawBankName] = useState("GTBank");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");

  // Transfer States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState("");

  // Notification States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const refreshNotifications = () => {
    if (currentUser) {
      setNotifications(storage.getNotifications().filter(n => n.userId === currentUser.id));
    }
  };

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    const all = storage.getNotifications();
    const updated = all.map(n => n.userId === currentUser.id ? { ...n, status: "read" as const } : n);
    storage.setNotifications(updated);
    setNotifications(updated.filter(n => n.userId === currentUser.id));
  };

  const handleDeleteNotif = (id: string) => {
    const all = storage.getNotifications();
    const updated = all.filter(n => n.id !== id);
    storage.setNotifications(updated);
    setNotifications(updated.filter(n => n.userId === currentUser.id));
  };

  useEffect(() => {
    const loadData = async () => {
      await storage.syncFromServer(); // Dynamic cloud database sync on mount!
      const playersList = storage.getPlayers();
      setTeams(storage.getTeams());
      setPlayers(playersList);
      setApplications(storage.getApplications());
      setTickets(storage.getTickets());
      setEvents(storage.getEvents());

      // Session persistent user lookup
      if (typeof window !== "undefined") {
        const savedUserId = sessionStorage.getItem("gh_session_user_id");
        if (savedUserId) {
          const found = playersList.find(p => p.id === savedUserId);
          if (found) {
            setCurrentUser(found);
            setIsDemo(false);
            setNotifications(storage.getNotifications().filter(n => n.userId === found.id));
          } else {
            setCurrentUser(DEMO_PLAYER);
            setIsDemo(true);
          }
        } else {
          setCurrentUser(DEMO_PLAYER);
          setIsDemo(true);
        }
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Save to Storage on changes
  useEffect(() => {
    if (isLoaded && !isDemo && currentUser) {
      storage.setPlayers(players);
    }
  }, [players, isLoaded, isDemo, currentUser]);

  useEffect(() => {
    if (isLoaded && !isDemo) {
      storage.setApplications(applications);
    }
  }, [applications, isLoaded, isDemo]);

  const handleLogout = () => {
    setCurrentUser(DEMO_PLAYER);
    setIsDemo(true);
    setShowPreview(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("gh_session_user_id");
    }
    alert("You have signed out.");
  };

  const handleCopyWalletId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.walletId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdrawFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !withdrawAmount || withdrawAmount <= 0) return;

    if (isDemo) {
      alert("Sign In Required: Please sign in with your email and OTP code to withdraw cash wallet balances.");
      setShowWithdrawModal(false);
      router.push("/login");
      return;
    }

    if (withdrawAmount > currentUser.cashWalletBalance) {
      alert("Insufficient balance.");
      return;
    }

    const amount = Number(withdrawAmount);
    const paymentDetails = `${withdrawBankName} - A/C: ${withdrawAccountNumber}`;

    // Add withdrawal request
    storage.addWithdrawal(currentUser.id, currentUser.name, amount, paymentDetails);

    // Deduct immediately (holding transaction)
    const updated = players.map(p => {
      if (p.id === currentUser.id) {
        const currentTxs = p.transactions || [];
        const newTx = {
          id: "tx_" + Math.random().toString(36).substr(2, 9),
          amount: -amount,
          description: `Withdrawal Request: ${paymentDetails} (Pending)`,
          date: new Date().toISOString().split('T')[0]
        };
        return {
          ...p,
          cashWalletBalance: p.cashWalletBalance - amount,
          transactions: [...currentTxs, newTx]
        };
      }
      return p;
    });

    setPlayers(updated);
    storage.setPlayers(updated);

    const refreshed = updated.find(p => p.id === currentUser.id);
    if (refreshed) {
      setCurrentUser(refreshed);
    }

    // Trigger In-App notifications
    storage.addNotification(
      currentUser.id,
      "Withdrawal Submitted",
      `Your request to withdraw ₦${amount.toLocaleString()} is pending admin review.`,
      "wallet"
    );
    storage.addNotification(
      "admin",
      "New Pending Withdrawal",
      `Player ${currentUser.name} requested ₦${amount.toLocaleString()} withdrawal to ${paymentDetails}.`,
      "wallet"
    );

    // Trigger Email log
    storage.addEmailLog(
      currentUser.email,
      currentUser.name,
      "Cash Withdrawal Request Received",
      `<p>Hello <strong>${currentUser.name}</strong>,</p><p>We have received your cash withdrawal request for <strong>₦${amount.toLocaleString()}</strong>.</p><p><strong>Payment Account:</strong> ${paymentDetails}</p><p><strong>Status:</strong> Pending Admin Approval</p><p>You will receive another notification once your payment is processed.</p>`,
      "notifications@gameshut.ng"
    );

    setWithdrawAmount("");
    setWithdrawAccountNumber("");
    setShowWithdrawModal(false);
    refreshNotifications();
    alert(`Withdrawal request logged successfully! ₦${amount.toLocaleString()} will arrive in your bank account once approved.`);
  };

  const handleTransfer = () => {
    if (!currentUser || !targetTeamId) return;
    
    if (isDemo) {
      alert("Sign In Required: Please sign in and verify your OTP to transfer teams.");
      setShowTransferModal(false);
      router.push("/login");
      return;
    }

    const targetTeam = teams.find(t => t.id === targetTeamId);
    if (!targetTeam) return;

    const pointsDeduction = 4;
    const updatedPoints = Math.max(0, currentUser.points - pointsDeduction);

    setPlayers(prev => prev.map(p => {
      if (p.id === currentUser.id) {
        return { ...p, teamId: targetTeam.id, points: updatedPoints };
      }
      return p;
    }));

    setCurrentUser(prev => ({ ...prev, teamId: targetTeam.id, points: updatedPoints }));
    setShowTransferModal(false);
    setTargetTeamId("");
    alert(`Transferred successfully to ${targetTeam.name}! 4 points adjusted.`);
  };

  const handleApproveApplication = (appId: string) => {
    if (isDemo) return;
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const pointsDeduction = 4;
    const updatedPlayers = players.map(p => {
      if (p.id === app.playerId) {
        return { ...p, teamId: app.targetTeamId, points: Math.max(0, p.points - pointsDeduction) };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    storage.setPlayers(updatedPlayers);

    const updatedApps = applications.map(a => a.id === appId ? { ...a, status: "approved" as const } : a);
    setApplications(updatedApps);
    storage.setApplications(updatedApps);

    if (currentUser && currentUser.id === app.playerId) {
      setCurrentUser(prev => ({ ...prev, teamId: app.targetTeamId, points: Math.max(0, prev.points - pointsDeduction) }));
    }
    alert(`Application approved! Player reassigned to team roster.`);
  };

  const handleDeclineApplication = (appId: string) => {
    if (isDemo) return;
    const updatedApps = applications.map(a => a.id === appId ? { ...a, status: "declined" as const } : a);
    setApplications(updatedApps);
    storage.setApplications(updatedApps);
    alert("Application declined.");
  };

  const getPlayerAchievements = (points: number, role: string, teamId: string | null) => {
    const badges = [];
    if (role === "captain") badges.push({ key: "captain", label: "Team Captain", desc: "Coordinates rosters and approves matches" });
    if (!teamId) badges.push({ key: "free_agent", label: "Free Agent", desc: "Available for team roster recruitment" });
    if (points >= 40) {
      badges.push({ key: "tactician", label: "Apex Tactician", desc: "Highest strategy percentile contributor" });
    } else if (points >= 15) {
      badges.push({ key: "regular", label: "Event Regular", desc: "Consistent presence at boardroom strategy events" });
    }
    return badges;
  };

  const getTeamName = (id: string | null) => {
    if (!id) return "Free Agent";
    const team = teams.find(t => t.id === id);
    return team ? team.name : "Free Agent";
  };

  // Find tickets/passes belonging to the current user
  const userTickets = currentUser ? tickets.filter(t => 
    t.playerId === currentUser.id || 
    (t.buyerEmail && t.buyerEmail.toLowerCase() === currentUser.email.toLowerCase())
  ) : [];

  // Find relative rank index in standings list
  const sortedStandings = [...players].sort((a, b) => b.points - a.points);
  const userRankIndex = currentUser ? sortedStandings.findIndex(p => p.id === currentUser.id) + 1 : 0;

  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: "80px 20px", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: "1.2rem", fontFamily: "var(--font-family)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', fontFamily: "var(--font-family)", position: "relative" }}>
      
      {/* 1. LOBBY / LOGGED OUT BANNER LOCK STATE (UX Improvement for signed out profiles) */}
      {isDemo && !showPreview && (
        <div style={{
          position: "absolute",
          top: "80px", left: "20px", right: "20px", bottom: "80px",
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(12px)",
          borderRadius: "24px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          textAlign: "center",
          border: "1px solid var(--card-border)"
        }} className="animate-fade-in">
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#fff", border: "1px solid var(--card-border)", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>My Profile</h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: "460px", lineHeight: 1.6, marginBottom: "30px" }}>
            Sign in to access your Cash wallet, Voucher wallet, upcoming event passes, and team standings.
          </p>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
            <button 
              className="btn-primary" 
              style={{ padding: "12px 30px", borderRadius: "8px", fontWeight: 700, fontFamily: "var(--font-family)" }}
              onClick={() => router.push("/login")}
            >
              Sign In
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: "12px 25px", borderRadius: "8px", fontWeight: 700, fontFamily: "var(--font-family)" }}
              onClick={() => setShowPreview(true)}
            >
              Explore Preview
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Alert when viewing Demonstration Mode */}
      {isDemo && showPreview && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '16px',
          padding: '15px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '40px',
          fontSize: '0.95rem'
        }} className="animate-fade-in">
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            ⚡ Preview Mode: You are viewing a demonstration profile card. Click Sign In to load your custom roster profile.
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '8px 15px', fontSize: '0.85rem', fontFamily: 'var(--font-family)' }}
              onClick={() => setShowPreview(false)}
            >
              Exit Preview
            </button>
            <button 
              className="btn-primary" 
              style={{ padding: '8px 20px', fontSize: '0.85rem', fontFamily: 'var(--font-family)' }}
              onClick={() => router.push("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Main Layout in clean light mode corporate glassmorphism */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in">
        
        {/* Profile Card Header */}
        <div className="corp-card" style={{ padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid var(--card-border)' }}>
              {getPlayerAvatarSVG(currentUser.avatar || "gamer", 44)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{currentUser.name}</h2>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                @{currentUser.username} • {currentUser.email}
              </span>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                <code style={{ background: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', border: '1px solid var(--card-border)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                  Player ID: {currentUser.walletId}
                </code>
                <button 
                  onClick={handleCopyWalletId}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "var(--accent-primary)", 
                    fontSize: "0.85rem", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px",
                    fontWeight: 700,
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {copied ? "Copied!" : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px", position: "relative" }}>
            
            {/* Notifications Bell Dropdown */}
            {!isDemo && (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  style={{
                    position: "relative",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--card-border)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "var(--card-shadow)"
                  }}
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {notifications.filter(n => n.status === "unread").length > 0 && (
                    <span style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      background: "#ef4444",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {notifications.filter(n => n.status === "unread").length}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div style={{
                    position: "absolute",
                    right: 0,
                    top: "50px",
                    width: "320px",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    padding: "15px",
                    zIndex: 1000
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "10px", marginBottom: "10px" }}>
                      <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Notifications</strong>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {notifications.length === 0 ? (
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textAlign: "center", padding: "20px 0" }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px", borderRadius: "10px", background: n.status === "unread" ? "rgba(99, 102, 241, 0.05)" : "transparent", border: "1px solid var(--card-border)" }}>
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ fontSize: "0.8rem", color: "var(--text-primary)", display: "block" }}>{n.title}</strong>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "2px", lineHeight: 1.4 }}>{n.message}</span>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
                                {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteNotif(n.id)}
                              style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer", alignSelf: "flex-start", padding: 0 }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isDemo ? (
              <button className="btn-secondary" style={{ padding: '8px 20px', borderColor: '#ef4444', color: '#ef4444', borderRadius: '8px', fontFamily: 'var(--font-family)' }} onClick={handleLogout}>
                Sign Out
              </button>
            ) : (
              <button className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', fontFamily: 'var(--font-family)' }} onClick={() => router.push("/login")}>
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Panels Grid */}
        <div className="panels-grid">
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Wallets Display Grid */}
            <div className="dashboard-grid">
              
              {/* Voucher Wallet Card (Custom SVG Ticket Icon, Regular Font Family for sums) */}
              <div className="corp-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                      <path d="M21 12H3m18-6H3m18 12H3" />
                    </svg>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Voucher Wallet</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.5px' }}>
                  <span>{getTicketIcon(22)}</span>
                  <span>{(currentUser.voucherWalletBalance || 0).toLocaleString()}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '10px' }}>
                  Redeemable on event tickets and shop items
                </span>
              </div>

              {/* Cash Wallet Card (Regular Font Family for sums) */}
              <div className="corp-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ padding: '6px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <line x1="12" y1="4" x2="12" y2="20" />
                    </svg>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash Wallet</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '15px', letterSpacing: '-0.5px' }}>
                  ₦{(currentUser.cashWalletBalance || 0).toLocaleString()}
                </div>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', marginTop: 'auto', fontFamily: 'var(--font-family)' }}
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Withdraw
                </button>
              </div>

            </div>

            {/* Strategy Rankings Card */}
            <div className="corp-card" style={{ padding: '30px' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Strategy Rankings</span>
                <span style={{ padding: "5px", background: "rgba(99, 102, 241, 0.08)", borderRadius: "6px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  </svg>
                </span>
              </div>
              <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {currentUser.points} <span style={{ fontSize: "1.2rem", color: "var(--text-secondary)", fontWeight: 400 }}>Points</span>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: "20px" }}>
                <div style={{ height: "6px", background: "var(--bg-primary)", borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
                  <div style={{ width: `${Math.min(100, (currentUser.points / 100) * 100)}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  <span>Rank: <strong>#{userRankIndex} Standings</strong></span>
                  <span>Event Milestone: <strong>100 Pts</strong></span>
                </div>
              </div>
            </div>

            {/* Badges / accomplishments */}
            <div className="corp-card" style={{ padding: '30px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team Accomplishments</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {getPlayerAchievements(currentUser.points, currentUser.role, currentUser.teamId).map((badge, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-primary)', padding: '12px 15px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <span>{getBadgeSVG(badge.key, 22)}</span>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>{badge.label}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{badge.desc}</span>
                    </div>
                  </div>
                ))}
                {getPlayerAchievements(currentUser.points, currentUser.role, currentUser.teamId).length === 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Attend upcoming board strategy events to earn strategic badges.</span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Event Passes */}
            <div className="corp-card" style={{ padding: '30px' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  My Active Event Passes
                </h3>
                <Link href="/events" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-block', borderRadius: '6px', fontFamily: 'var(--font-family)' }}>
                  Book Event
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                {userTickets.length > 0 ? (
                  userTickets.map((t) => {
                    const matchedEvent = events.find(e => e.id === t.eventId);
                    return (
                      <div key={t.id} style={{ padding: '15px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{matchedEvent?.title || "Board Strategy Event"}</strong>
                          {t.status === "checked_in" ? (
                            <span style={{ fontSize: '0.7rem', background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>Checked In (+5 Pts)</span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>Pass Active</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Session: {t.sessionDate && t.sessionTime ? `${t.sessionDate} • ${t.sessionTime}` : (matchedEvent?.date || "TBD")}
                        </div>
                        {t.tierName && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700, marginTop: '4px' }}>
                            {t.tierName} • Qty: {t.quantity}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    No active event passes found. Buy ticket passes on the Events calendar page to join board events.
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Ledger */}
            <div className="corp-card" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Recent Transaction Ledger
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                {currentUser.transactions && currentUser.transactions.length > 0 ? (
                  currentUser.transactions.map((tx) => {
                    const isDebit = tx.amount < 0;
                    return (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ padding: '6px', background: isDebit ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', display: 'flex' }}>
                            {isDebit ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <polyline points="19 12 12 19 5 12" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                                <line x1="12" y1="19" x2="12" y2="5" />
                                <polyline points="5 12 12 5 19 12" />
                              </svg>
                            )}
                          </span>
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{tx.description}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.date}</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isDebit ? '#dc2626' : '#16a34a' }}>
                          {isDebit ? `-₦${Math.abs(tx.amount).toLocaleString()}` : `+₦${tx.amount.toLocaleString()}`}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No ledger records logged.</div>
                )}
              </div>

              {/* Team alignments bottom card */}
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '20px', marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Team Roster</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{getTeamName(currentUser.teamId)}</strong>
                  </div>
                  {currentUser.teamId ? (
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '8px', fontFamily: 'var(--font-family)' }} onClick={() => setShowTransferModal(true)}>
                      Transfer Team
                    </button>
                  ) : (
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '8px', fontFamily: 'var(--font-family)' }} onClick={() => setShowTransferModal(true)}>
                      Assign Team
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Conditional Captain control panel for live roster approvals */}
        {!isDemo && currentUser.role === "captain" && (
          <div className="corp-card" style={{ marginTop: "30px" }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "15px" }}>
              📢 Captains Control Panel
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.9rem" }}>Review applications of players seeking to join your team roster.</p>
            
            {applications.filter(a => a.targetTeamId === currentUser.teamId && a.status === "pending").length === 0 ? (
              <div style={{ color: "var(--text-secondary)", padding: "20px 0", textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: "8px" }}>
                No pending applications to your team.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {applications.filter(a => a.targetTeamId === currentUser.teamId && a.status === "pending").map(app => (
                  <div key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--card-border)", padding: "15px", borderRadius: "12px", background: "var(--bg-primary)" }}>
                    <div>
                      <strong style={{ color: "var(--text-primary)" }}>{app.playerName}</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Wants to join {app.targetTeamName}</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="btn-primary" style={{ padding: "6px 15px", fontSize: "0.8rem", borderRadius: "8px", fontFamily: 'var(--font-family)' }} onClick={() => handleApproveApplication(app.id)}>
                        Approve
                      </button>
                      <button className="btn-secondary" style={{ padding: "6px 15px", fontSize: "0.8rem", color: "#ef4444", borderRadius: "8px", fontFamily: 'var(--font-family)' }} onClick={() => handleDeclineApplication(app.id)}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cash Withdrawals Registry */}
        {!isDemo && (
          <div className="corp-card" style={{ marginTop: "30px", padding: "30px" }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
              💸 Cash Withdrawals Registry
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.9rem" }}>
              Track your cash withdrawal submissions and payment processing status.
            </p>
            {storage.getWithdrawals().filter(w => w.playerId === currentUser.id).length === 0 ? (
              <div style={{ color: "var(--text-secondary)", padding: "20px 0", textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: "8px" }}>
                No withdrawal requests found.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-secondary)", textAlign: "left" }}>
                      <th style={{ padding: "10px" }}>Date</th>
                      <th style={{ padding: "10px" }}>Amount</th>
                      <th style={{ padding: "10px" }}>Account Details</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storage.getWithdrawals().filter(w => w.playerId === currentUser.id).map((w) => (
                      <tr key={w.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                        <td style={{ padding: "10px" }}>{new Date(w.createdAt).toLocaleString()}</td>
                        <td style={{ padding: "10px", fontWeight: 700 }}>₦{w.amount.toLocaleString()}</td>
                        <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{w.paymentDetails}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: w.status === "pending" ? "#fef3c7" : w.status === "approved" ? "#d1fae5" : "#fee2e2",
                            color: w.status === "pending" ? "#d97706" : w.status === "approved" ? "#065f46" : "#991b1b"
                          }}>
                            {w.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}



      </div>

      {/* BANK WITHDRAWAL OVERLAY MODAL */}
      {showWithdrawModal && currentUser && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1100,
          padding: "20px"
        }}>
          <div className="corp-card" style={{ maxWidth: "450px", width: "100%", background: "#ffffff", border: "1px solid var(--card-border)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>Withdraw Cash to Bank</h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ background: "#e6fffa", borderLeft: "4px solid #10b981", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem", color: "#166534" }}>
              Available Cash Balance: <strong>₦{currentUser.cashWalletBalance.toLocaleString()}</strong>
            </div>

            <form onSubmit={handleWithdrawFunds}>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Select Bank</label>
                  <select 
                    value={withdrawBankName} 
                    onChange={(e) => setWithdrawBankName(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", fontFamily: 'var(--font-family)' }}
                  >
                    <option value="GTBank">Guaranty Trust Bank (GTB)</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="UBA">United Bank for Africa (UBA)</option>
                    <option value="First Bank">First Bank of Nigeria</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Account Number (10 Digits)</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={10}
                    minLength={10}
                    value={withdrawAccountNumber} 
                    onChange={(e) => setWithdrawAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="0123456789" 
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--card-border)", fontFamily: 'var(--font-family)' }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Withdrawal Amount (₦)</label>
                  <input 
                    type="number" 
                    required 
                    min={100}
                    max={currentUser.cashWalletBalance}
                    value={withdrawAmount} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setWithdrawAmount(val === "" ? "" : Number(val));
                    }}
                    placeholder="Enter amount to withdraw" 
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--card-border)", fontFamily: 'var(--font-family)' }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  type="button"
                  className="btn-secondary" 
                  style={{ flex: 1, padding: "12px", borderRadius: "8px", fontFamily: 'var(--font-family)' }}
                  onClick={() => setShowWithdrawModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1, padding: "12px", borderRadius: "8px", fontFamily: 'var(--font-family)' }}
                  disabled={!withdrawAccountNumber || !withdrawAmount || withdrawAmount <= 0}
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM TRANSFER MODAL */}
      {showTransferModal && currentUser && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div className="corp-card" style={{ maxWidth: "500px", width: "100%", background: "#ffffff", border: "1px solid var(--card-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>Confirm Team Transfer</h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ background: "#fff5f5", color: "#c53030", padding: "15px", borderRadius: "8px", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "25px", borderLeft: "4px solid #ef4444" }}>
              Warning: Point Adjustment Rule
              <br/>
              Transferring teams automatically triggers a **4 points adjustment deduction** from your individual standings score to prevent roster exploitation.
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "8px", fontWeight: 600 }}>Select Destination Team</label>
              <select 
                value={targetTeamId} 
                onChange={(e) => setTargetTeamId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", fontFamily: 'var(--font-family)' }}
              >
                <option value="">-- Choose Team --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, padding: "12px", borderRadius: "8px", fontFamily: 'var(--font-family)' }}
                onClick={() => setShowTransferModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: "12px", background: "#ef4444", borderColor: "#ef4444", borderRadius: "8px", fontFamily: 'var(--font-family)' }}
                onClick={handleTransfer}
                disabled={!targetTeamId}
              >
                Confirm & Transfer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
