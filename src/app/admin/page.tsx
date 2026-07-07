"use client";
import { useState, useEffect } from "react";
import { storage, Player, Team, GameEvent, Product, Ticket, Application, TicketTier, EventSession, AppNotification, EmailLog, WithdrawalRequest } from "@/lib/storage";
import { getPlayerAvatarSVG } from "../login/page";

const getTeamLogoSVG = (logoKey: string, size = 24) => {
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

const getProductSVG = (imageKey: string, size = 32) => {
  if (imageKey === "chess") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (imageKey === "jenga") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-secondary)" }}>
        <rect x="3" y="3" width="18" height="4" rx="1" />
        <rect x="5" y="10" width="14" height="4" rx="1" />
        <rect x="3" y="17" width="18" height="4" rx="1" />
      </svg>
    );
  }
  if (imageKey === "catan") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#d97706" }}>
        <path d="M12 2l9 4.9v10.2L12 22l-9-4.9V6.9L12 2z" />
        <path d="M12 22V12" />
        <path d="M12 12L3 6.9" />
        <path d="M12 12l9-5.1" />
      </svg>
    );
  }
  if (imageKey === "puzzle") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }
  if (imageKey === "bundle") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#818cf8" }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }
  if (imageKey === "mat") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <path d="M12 17V3" />
    </svg>
  );
};

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "players" | "teams" | "events" | "tickets" | "shop" | "settings" | "notifications">("analytics");
  const [isLoaded, setIsLoaded] = useState(false);

  // Synced States
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Selection state - Tickets per event
  const [selectedCheckInEventId, setSelectedCheckInEventId] = useState<string | null>(null);
  const [ticketSearch, setTicketSearch] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");

  // Form states - Players
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerEmail, setNewPlayerEmail] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<"player" | "captain" | "admin">("player");
  const [newPlayerTeam, setNewPlayerTeam] = useState("");
  const [pointModifiers, setPointModifiers] = useState<{ [playerId: string]: number }>({});

  // Admin Wallet modification Overlay states
  const [selectedWalletPlayer, setSelectedWalletPlayer] = useState<Player | null>(null);
  const [adminWalletType, setAdminWalletType] = useState<"cash" | "voucher">("voucher");
  const [adminWalletAction, setAdminWalletAction] = useState<"credit" | "debit">("credit");
  const [adminWalletAmount, setAdminWalletAmount] = useState<number | "">("");
  const [adminWalletReason, setAdminWalletReason] = useState("");

  // Wallet ID lookup forms
  const [lookupWalletId, setLookupWalletId] = useState("");
  const [lookupWalletType, setLookupWalletType] = useState<"cash" | "voucher">("voucher");
  const [lookupWalletAmount, setLookupWalletAmount] = useState<number | "">("");
  const [lookupWalletReason, setLookupWalletReason] = useState("");

  // Form states - Teams
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamCaptain, setNewTeamCaptain] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("shield");

  // Form states - Events with dynamic ticket tiers & sessions
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventPrice, setNewEventPrice] = useState(5000);
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventPosterUrl, setNewEventPosterUrl] = useState("");
  
  const [newEventTiers, setNewEventTiers] = useState<TicketTier[]>([
    { name: "Standard Entry", price: 5000 }
  ]);
  const [newEventSessions, setNewEventSessions] = useState<EventSession[]>([
    { date: "", time: "" }
  ]);

  // Form states - Products
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState(0);
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"Board Games" | "Card Games" | "Puzzles">("Board Games");
  const [newProdImage, setNewProdImage] = useState("https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&auto=format&fit=crop&q=60");

  // Notifications & Withdrawals States
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AppNotification[]>([]);
  const [adminEmails, setAdminEmails] = useState<EmailLog[]>([]);
  const [showAdminNotifDropdown, setShowAdminNotifDropdown] = useState(false);

  const refreshAdminLogs = () => {
    setWithdrawals(storage.getWithdrawals());
    setAdminNotifications(storage.getNotifications());
    setAdminEmails(storage.getEmailLogs());
  };

  useEffect(() => {
    const loadData = async () => {
      // Authenticated session check
      const auth = sessionStorage.getItem("gh_admin_auth");
      if (auth === "true") {
        setIsAdmin(true);
      }
      
      await storage.syncFromServer();
      
      // Load local storage values
      setPlayers(storage.getPlayers());
      setTeams(storage.getTeams());
      setEvents(storage.getEvents());
      setProducts(storage.getProducts());
      setTickets(storage.getTickets());
      
      // Load notifications & withdrawals
      setWithdrawals(storage.getWithdrawals());
      setAdminNotifications(storage.getNotifications());
      setAdminEmails(storage.getEmailLogs());
      setApplications(storage.getApplications());
      setIsLoaded(true);
    };
    loadData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === "GAMESHUT2026") {
      setIsAdmin(true);
      sessionStorage.setItem("gh_admin_auth", "true");
    } else {
      alert("Invalid Access Code. Access Denied.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("gh_admin_auth");
  };

  // Helper to determine status of events based on date string relative to simulated date: July 04, 2026
  const getEventStatus = (dateStr: string): "past" | "active" | "upcoming" => {
    try {
      const eventDate = new Date(dateStr);
      const today = new Date("2026-07-04");
      
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = eventDate.getTime() - today.getTime();
      if (diffTime === 0) return "active";
      if (diffTime < 0) return "past";
      return "upcoming";
    } catch {
      return "upcoming";
    }
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName || !newPlayerEmail) return;

    // Generate Unique Wallet ID format: GSH-XXXX-XXXX
    const walletId = `GSH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedUsername = newPlayerName.toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(10 + Math.random() * 90);

    const newPlayer: Player = {
      id: "p_" + Math.random().toString(36).substr(2, 9),
      name: newPlayerName,
      username: generatedUsername,
      email: newPlayerEmail,
      password: "password123",
      role: newPlayerRole,
      teamId: newPlayerTeam || null,
      points: 0,
      walletId: walletId,
      cashWalletBalance: 0,
      voucherWalletBalance: 0,
      transactions: []
    };

    const updated = [...players, newPlayer];
    setPlayers(updated);
    storage.setPlayers(updated);

    // Reset Form
    setNewPlayerName("");
    setNewPlayerEmail("");
    setNewPlayerRole("player");
    setNewPlayerTeam("");
    alert(`Player added successfully! Unique Wallet ID: ${walletId}`);
  };

  const handleDeletePlayer = (id: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return;
    const updated = players.filter(p => p.id !== id);
    setPlayers(updated);
    storage.setPlayers(updated);
  };

  const handleModifyPoints = (playerId: string, sign: 1 | -1) => {
    // If the input modifier is empty, 0, or undefined, default to modifying by 1 point!
    const val = pointModifiers[playerId];
    const amount = (val === undefined || val === 0) ? 1 : val;
    const delta = amount * sign;
    if (delta === 0) return;

    const updated = players.map(p => {
      if (p.id === playerId) {
        return { ...p, points: Math.max(0, p.points + delta) };
      }
      return p;
    });

    setPlayers(updated);
    storage.setPlayers(updated);

    // Trigger Notification & Email alerts
    const targetPlayer = players.find(p => p.id === playerId);
    if (targetPlayer) {
      const signLabel = delta > 0 ? "added" : "subtracted";
      storage.addNotification(
        playerId,
        `Points ${delta > 0 ? "Credited" : "Deducted"}`,
        `Admin has ${signLabel} ${Math.abs(delta)} activity points. New Balance: ${Math.max(0, targetPlayer.points + delta)} pts.`,
        "team"
      );
      storage.addEmailLog(
        targetPlayer.email,
        targetPlayer.name,
        `Activity Points Update Alert`,
        `<p>Hello <strong>${targetPlayer.name}</strong>,</p><p>Your activity points standing has been updated by an administrator.</p><p><strong>Action:</strong> ${Math.abs(delta)} points ${signLabel}</p><p><strong>New Points Standing:</strong> ${Math.max(0, targetPlayer.points + delta)} points</p>`,
        "notifications@gameshut.ng"
      );
    }
    
    // Reset inputs
    setPointModifiers(prev => ({ ...prev, [playerId]: 0 }));
    refreshAdminLogs();
  };

  const handleAdminWalletModify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletPlayer || !adminWalletAmount || adminWalletAmount <= 0) return;

    const amount = Number(adminWalletAmount);
    const sign = adminWalletAction === "credit" ? 1 : -1;
    const reason = adminWalletReason || (adminWalletAction === "credit" ? "Admin prize credit award" : "Admin wallet debit correction");

    const updated = players.map(p => {
      if (p.id === selectedWalletPlayer.id) {
        const currentTxs = p.transactions || [];
        const newTx = {
          id: "tx_" + Math.random().toString(36).substr(2, 9),
          amount: amount * sign,
          description: reason,
          date: new Date().toISOString().split('T')[0]
        };

        let updatedCash = p.cashWalletBalance || 0;
        let updatedVoucher = p.voucherWalletBalance || 0;

        if (adminWalletType === "cash") {
          updatedCash = Math.max(0, updatedCash + (amount * sign));
        } else {
          updatedVoucher = Math.max(0, updatedVoucher + (amount * sign));
        }

        return {
          ...p,
          cashWalletBalance: updatedCash,
          voucherWalletBalance: updatedVoucher,
          transactions: [...currentTxs, newTx]
        };
      }
      return p;
    });

    setPlayers(updated);
    storage.setPlayers(updated);

    // Trigger Notification & Email dispatches
    const actionVerb = adminWalletAction === "credit" ? "credited" : "debited";
    const walletLabel = adminWalletType === "cash" ? "cash" : "voucher";
    storage.addNotification(
      selectedWalletPlayer.id,
      `Wallet ${adminWalletAction === "credit" ? "Credited" : "Debited"}`,
      `Admin has ${actionVerb} ₦${amount.toLocaleString()} ${walletLabel} balance. Reason: ${reason}`,
      "wallet"
    );
    storage.addEmailLog(
      selectedWalletPlayer.email,
      selectedWalletPlayer.name,
      `Wallet Transaction Alert: ₦${amount.toLocaleString()}`,
      `<p>Hello <strong>${selectedWalletPlayer.name}</strong>,</p><p>We are notifying you that an administrator has ${actionVerb} your <strong>${walletLabel} balance</strong>.</p><p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p><p><strong>Reason / Reference:</strong> ${reason}</p>`,
      "notifications@gameshut.ng"
    );

    // Reset
    setSelectedWalletPlayer(null);
    setAdminWalletAmount("");
    setAdminWalletReason("");
    refreshAdminLogs();
    alert("Player wallet updated successfully!");
  };

  const handleLookupWalletCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupWalletId || !lookupWalletAmount || lookupWalletAmount <= 0) return;

    const formattedId = lookupWalletId.trim().toUpperCase();
    const playersList = storage.getPlayers();
    const matched = playersList.find(p => p.walletId?.toUpperCase() === formattedId);

    if (!matched) {
      alert(`No registered player profile matches Wallet ID: ${formattedId}. Please verify the ID format.`);
      return;
    }

    const amount = Number(lookupWalletAmount);
    const reason = lookupWalletReason || "Admin prize credit by ID";

    const updated = players.map(p => {
      if (p.id === matched.id) {
        const currentTxs = p.transactions || [];
        const newTx = {
          id: "tx_" + Math.random().toString(36).substr(2, 9),
          amount: amount,
          description: reason,
          date: new Date().toISOString().split('T')[0]
        };

        let updatedCash = p.cashWalletBalance || 0;
        let updatedVoucher = p.voucherWalletBalance || 0;

        if (lookupWalletType === "cash") {
          updatedCash += amount;
        } else {
          updatedVoucher += amount;
        }

        return {
          ...p,
          cashWalletBalance: updatedCash,
          voucherWalletBalance: updatedVoucher,
          transactions: [...currentTxs, newTx]
        };
      }
      return p;
    });

    setPlayers(updated);
    storage.setPlayers(updated);

    // Trigger Notification & Email alerts
    const walletLabel = lookupWalletType === "cash" ? "cash" : "voucher";
    storage.addNotification(
      matched.id,
      "Wallet Credited",
      `Admin credited ₦${amount.toLocaleString()} to your ${walletLabel} balance. Reason: ${reason}`,
      "wallet"
    );
    storage.addEmailLog(
      matched.email,
      matched.name,
      `Wallet Credit Receipt: ₦${amount.toLocaleString()}`,
      `<p>Hello <strong>${matched.name}</strong>,</p><p>An administrator has credited your <strong>${walletLabel} balance</strong>.</p><p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p><p><strong>Reason:</strong> ${reason}</p><p><strong>Player ID:</strong> ${formattedId}</p>`,
      "notifications@gameshut.ng"
    );

    // Reset
    setLookupWalletId("");
    setLookupWalletAmount("");
    setLookupWalletReason("");
    refreshAdminLogs();
    alert(`Successfully credited ₦${amount.toLocaleString()} to ${matched.name} (${formattedId})!`);
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !newTeamCaptain) return;

    const newTeam: Team = {
      id: "t_" + Math.random().toString(36).substr(2, 9),
      name: newTeamName,
      captain: newTeamCaptain,
      logo: newTeamLogo
    };

    const updated = [...teams, newTeam];
    setTeams(updated);
    storage.setTeams(updated);

    setNewTeamName("");
    setNewTeamCaptain("");
    setNewTeamLogo("shield");
    alert("Team created successfully!");
  };

  const handleDeleteTeam = (id: string) => {
    if (!confirm("Deleting this team will set all members as Free Agents. Proceed?")) return;
    const updatedTeams = teams.filter(t => t.id !== id);
    setTeams(updatedTeams);
    storage.setTeams(updatedTeams);

    // Release players
    const updatedPlayers = players.map(p => p.teamId === id ? { ...p, teamId: null } : p);
    setPlayers(updatedPlayers);
    storage.setPlayers(updatedPlayers);
  };

  const handleAwardTeamWin = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    if (!confirm(`Are you sure you want to award a win to ${team.name}? Every player currently on this team will receive +5 points, and the team score will increase by 5.`)) return;

    const updatedPlayers = players.map(p => {
      if (p.teamId === teamId) {
        return { ...p, points: p.points + 5 };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    storage.setPlayers(updatedPlayers);

    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return { ...t, points: (t.points || 0) + 5 };
      }
      return t;
    });
    setTeams(updatedTeams);
    storage.setTeams(updatedTeams);

    alert(`Successfully awarded 5 points to all players of ${team.name} and updated the team standings!`);
  };

  const handleApproveApplication = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    // Apply the 4 points transfer penalty deduction rule
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
    alert(`Transfer request approved! Roster reassigned with a 4 points deduction penalty.`);
  };

  const handleDeclineApplication = (appId: string) => {
    const updatedApps = applications.map(a => a.id === appId ? { ...a, status: "declined" as const } : a);
    setApplications(updatedApps);
    storage.setApplications(updatedApps);
    alert("Transfer request declined.");
  };

  // dynamic ticket tier managers
  const handleAddTierRow = () => {
    setNewEventTiers([...newEventTiers, { name: "", price: 0 }]);
  };
  const handleRemoveTierRow = (idx: number) => {
    setNewEventTiers(newEventTiers.filter((_, i) => i !== idx));
  };
  const handleTierRowChange = (idx: number, field: "name" | "price", val: string | number) => {
    setNewEventTiers(newEventTiers.map((tier, i) => {
      if (i === idx) {
        return { ...tier, [field]: val };
      }
      return tier;
    }));
  };

  // dynamic session managers
  const handleAddSessionRow = () => {
    setNewEventSessions([...newEventSessions, { date: "", time: "" }]);
  };
  const handleRemoveSessionRow = (idx: number) => {
    setNewEventSessions(newEventSessions.filter((_, i) => i !== idx));
  };
  const handleSessionRowChange = (idx: number, field: "date" | "time", val: string) => {
    setNewEventSessions(newEventSessions.map((sess, i) => {
      if (i === idx) {
        return { ...sess, [field]: val };
      }
      return sess;
    }));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventLocation) return;

    // Filter valid ticket tiers and sessions
    const validTiers = newEventTiers.filter(t => t.name.trim() !== "");
    const validSessions = newEventSessions.filter(s => s.date.trim() !== "");

    // Core fallback values
    const primaryDate = validSessions[0]?.date || newEventDate || "TBD";
    const primaryTime = validSessions[0]?.time || newEventTime || "TBD";
    const basePrice = validTiers[0]?.price || newEventPrice || 0;

    const newEv: GameEvent = {
      id: "e_" + Math.random().toString(36).substr(2, 9),
      title: newEventTitle,
      date: primaryDate,
      time: primaryTime,
      location: newEventLocation,
      price: basePrice,
      description: newEventDesc,
      posterUrl: newEventPosterUrl || undefined,
      tiers: validTiers.length > 0 ? validTiers : undefined,
      sessions: validSessions.length > 0 ? validSessions : undefined
    };

    const updated = [...events, newEv];
    setEvents(updated);
    storage.setEvents(updated);

    // Reset Form
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventTime("");
    setNewEventLocation("");
    setNewEventPrice(5000);
    setNewEventDesc("");
    setNewEventPosterUrl("");
    setNewEventTiers([{ name: "Standard Entry", price: 5000 }]);
    setNewEventSessions([{ date: "", time: "" }]);
    alert("Event scheduled successfully!");
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    storage.setEvents(updated);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newPr: Product = {
      id: "p_" + Math.random().toString(36).substr(2, 9),
      name: newProdName,
      price: Number(newProdPrice),
      description: newProdDesc,
      category: newProdCategory,
      image: newProdImage
    };

    const updated = [...products, newPr];
    setProducts(updated);
    storage.setProducts(updated);

    setNewProdName("");
    setNewProdPrice(0);
    setNewProdDesc("");
    setNewProdCategory("Board Games");
    setNewProdImage("https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&auto=format&fit=crop&q=60");
    alert("Product added successfully!");
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    storage.setProducts(updated);
  };

  const handleCheckIn = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (ticket.status === "checked_in") return;

    // 1. Mark ticket as checked_in
    const updatedTickets = tickets.map(t => t.id === ticketId ? { ...t, status: "checked_in" as const } : t);
    setTickets(updatedTickets);
    storage.setTickets(updatedTickets);

    // 2. Add 5 points reward to the player
    const playersList = storage.getPlayers();
    const matchedPlayer = playersList.find(
      p => p.id === ticket.playerId ||
           p.email.toLowerCase() === ticket.buyerEmail.toLowerCase() ||
           p.name.toLowerCase() === ticket.buyerName.toLowerCase()
    );

    if (matchedPlayer) {
      const updatedPlayers = playersList.map(p => {
        if (p.id === matchedPlayer.id) {
          return { ...p, points: p.points + 5 };
        }
        return p;
      });
      setPlayers(updatedPlayers);
      storage.setPlayers(updatedPlayers);
      alert(`Check-in successful! 5 points have been credited to ${matchedPlayer.name}'s leaderboard score.`);
    } else {
      alert("Check-in marked, but no linked player profile was found for this ticket email or name.");
    }
  };

  const handleFactoryReset = () => {
    if (!confirm("WARNING: This will erase all administrative edits and restore the system to defaults. Proceed?")) return;
    storage.factoryReset();
    alert("System database reset successfully!");
    // Reload state
    setPlayers(storage.getPlayers());
    setTeams(storage.getTeams());
    setEvents(storage.getEvents());
    setProducts(storage.getProducts());
    setTickets(storage.getTickets());
    setApplications(storage.getApplications());
    setSelectedCheckInEventId(null);
    refreshAdminLogs();
  };

  const handleApproveWithdrawal = (id: string) => {
    const allWds = storage.getWithdrawals();
    const target = allWds.find(w => w.id === id);
    if (!target || target.status !== "pending") return;

    const updatedWds = allWds.map(w => w.id === id ? { ...w, status: "approved" as const } : w);
    storage.setWithdrawals(updatedWds);

    const playersList = storage.getPlayers();
    const player = playersList.find(p => p.id === target.playerId);
    if (player) {
      storage.addNotification(
        player.id,
        "Withdrawal Approved",
        `Your withdrawal of ₦${target.amount.toLocaleString()} has been approved and paid out.`,
        "wallet"
      );
      storage.addNotification(
        "admin",
        "Withdrawal Approved",
        `Withdrawal request ${id} for ${player.name} was approved.`,
        "wallet"
      );
      storage.addEmailLog(
        player.email,
        player.name,
        "Withdrawal Processed & Paid",
        `<p>Hello <strong>${player.name}</strong>,</p><p>Your withdrawal request for <strong>₦${target.amount.toLocaleString()}</strong> has been approved and successfully paid out to your bank account.</p><p><strong>Account:</strong> ${target.paymentDetails}</p><p>Thank you for gaming with GamesHut!</p>`,
        "notifications@gameshut.ng"
      );
    }

    refreshAdminLogs();
    alert("Withdrawal request approved successfully.");
  };

  const handleDeclineWithdrawal = (id: string) => {
    const allWds = storage.getWithdrawals();
    const target = allWds.find(w => w.id === id);
    if (!target || target.status !== "pending") return;

    const updatedWds = allWds.map(w => w.id === id ? { ...w, status: "declined" as const } : w);
    storage.setWithdrawals(updatedWds);

    // Refund cash back
    const playersList = storage.getPlayers();
    const updatedPlayers = playersList.map(p => {
      if (p.id === target.playerId) {
        const currentTxs = p.transactions || [];
        const refundTx = {
          id: "tx_" + Math.random().toString(36).substr(2, 9),
          amount: target.amount,
          description: `Refund: Declined Withdrawal Request (${target.id})`,
          date: new Date().toISOString().split('T')[0]
        };
        return {
          ...p,
          cashWalletBalance: p.cashWalletBalance + target.amount,
          transactions: [...currentTxs, refundTx]
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    storage.setPlayers(updatedPlayers);

    const player = updatedPlayers.find(p => p.id === target.playerId);
    if (player) {
      storage.addNotification(
        player.id,
        "Withdrawal Declined",
        `Your withdrawal of ₦${target.amount.toLocaleString()} was declined. The funds have been refunded to your cash balance.`,
        "wallet"
      );
      storage.addNotification(
        "admin",
        "Withdrawal Declined",
        `Withdrawal request ${id} for ${player.name} was declined and refunded.`,
        "wallet"
      );
      storage.addEmailLog(
        player.email,
        player.name,
        "Withdrawal Request Declined",
        `<p>Hello <strong>${player.name}</strong>,</p><p>Your withdrawal request for <strong>₦${target.amount.toLocaleString()}</strong> has been declined.</p><p>The funds have been fully refunded back to your cash wallet balance.</p><p>If you believe this is an error, please reach out to support.</p>`,
        "notifications@gameshut.ng"
      );
    }

    refreshAdminLogs();
    alert("Withdrawal request declined and funds refunded.");
  };

  const getTeamName = (id: string | null) => {
    if (!id) return "Free Agent";
    const team = teams.find(t => t.id === id);
    return team ? team.name : "Free Agent";
  };

  const getTeamPoints = (teamId: string) => {
    return players
      .filter(p => p.teamId === teamId)
      .reduce((sum, p) => sum + p.points, 0);
  };

  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: "80px 20px", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}>Initializing admin console...</div>
      </div>
    );
  }

  // Authentication Gate
  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: "120px 20px", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="corp-card animate-fade-in" style={{ maxWidth: "450px", width: "100%", textAlign: "center" }}>
          <div style={{ marginBottom: "15px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)", margin: "0 auto" }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "10px" }}>Admin Authorization</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "30px", fontSize: "0.95rem" }}>Enter your security credentials to access administrative views.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              id="admin-auth-code"
              type="password"
              placeholder="Enter Admin Code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid var(--card-border)", marginBottom: "20px", textAlign: "center", letterSpacing: "2px" }}
              required
            />
            <button id="admin-auth-submit" type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }}>Access Panel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "80px 20px", minHeight: "80vh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "25px", marginBottom: "40px" }} className="animate-fade-in">
        <div>
          <span style={{ textTransform: "uppercase", fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 700, letterSpacing: "1.5px" }}>Control Center</span>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "5px" }}>Admin Operations</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px", position: "relative" }}>
          {/* Notifications Bell Dropdown */}
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
              onClick={() => setShowAdminNotifDropdown(!showAdminNotifDropdown)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {adminNotifications.filter(n => n.userId === "admin" && n.status === "unread").length > 0 && (
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
                  {adminNotifications.filter(n => n.userId === "admin" && n.status === "unread").length}
                </span>
              )}
            </button>

            {showAdminNotifDropdown && (
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
                  <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Admin Alerts</strong>
                  {adminNotifications.filter(n => n.userId === "admin").length > 0 && (
                    <button
                      onClick={() => {
                        const all = storage.getNotifications();
                        const updated = all.map(n => n.userId === "admin" ? { ...n, status: "read" as const } : n);
                        storage.setNotifications(updated);
                        refreshAdminLogs();
                      }}
                      style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {adminNotifications.filter(n => n.userId === "admin").length === 0 ? (
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textAlign: "center", padding: "20px 0" }}>
                      No alerts yet.
                    </div>
                  ) : (
                    adminNotifications.filter(n => n.userId === "admin").map(n => (
                      <div key={n.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px", borderRadius: "10px", background: n.status === "unread" ? "rgba(99, 102, 241, 0.05)" : "transparent", border: "1px solid var(--card-border)" }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: "0.8rem", color: "var(--text-primary)", display: "block" }}>{n.title}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "2px", lineHeight: 1.4 }}>{n.message}</span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
                            {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const all = storage.getNotifications();
                            const updated = all.filter(item => item.id !== n.id);
                            storage.setNotifications(updated);
                            refreshAdminLogs();
                          }}
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

          <button id="admin-logout-btn" className="btn-secondary" style={{ borderColor: "#ef4444", color: "#ef4444", padding: "10px 20px" }} onClick={handleLogout}>
            Lock Console
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "40px" }} className="animate-fade-in">
        {[
          { id: "analytics", label: "Dashboard & Analytics" },
          { id: "players", label: "Players & Scores" },
          { id: "teams", label: "Team Rosters" },
          { id: "events", label: "Events Calendar" },
          { id: "tickets", label: "Check-In & Tickets" },
          { id: "shop", label: "Shop Inventory" },
          { id: "notifications", label: "System Alerts & Logs" },
          { id: "settings", label: "System Settings" }
        ].map(tab => (
          <button 
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            className={activeTab === tab.id ? "btn-primary" : "btn-secondary"}
            style={{ padding: "10px 20px" }}
            onClick={() => {
              setActiveTab(tab.id as any);
              refreshAdminLogs();
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="animate-fade-in">
        
        {/* TAB 0: ANALYTICS OVERVIEW */}
        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* KPI Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              <div className="corp-card" style={{ padding: "25px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Registered Players</span>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "10px" }}>{players.length}</div>
              </div>
              <div className="corp-card" style={{ padding: "25px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Roster Groups</span>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "10px" }}>{teams.length}</div>
              </div>
              <div className="corp-card" style={{ padding: "25px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Ticket Passes Issued</span>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "10px" }}>{tickets.length}</div>
              </div>
              <div className="corp-card" style={{ padding: "25px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>Ticket Sales Revenue</span>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--accent-primary)", marginTop: "10px" }}>
                  ₦{tickets.reduce((sum, t) => sum + t.totalPaid, 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Point Distribution Charts */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
              {/* Team points bar chart */}
              <div className="corp-card" style={{ flex: "2 1 450px", padding: "30px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Team Points Spread</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {teams.map(t => {
                    const pts = getTeamPoints(t.id);
                    const maxPts = Math.max(...teams.map(team => getTeamPoints(team.id)), 1);
                    const percentage = (pts / maxPts) * 100;
                    return (
                      <div key={t.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "6px" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                            {getTeamLogoSVG(t.logo, 18)} {t.name}
                          </span>
                          <strong style={{ color: "var(--accent-primary)" }}>{pts} pts</strong>
                        </div>
                        <div style={{ height: "10px", background: "var(--bg-primary)", borderRadius: "5px", overflow: "hidden" }}>
                          <div style={{ width: `${percentage}%`, height: "100%", background: "var(--accent-primary)", borderRadius: "5px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General metrics summary */}
              <div className="corp-card" style={{ flex: "1 1 280px", padding: "30px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Activity Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", fontSize: "0.95rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--card-border)", paddingBottom: "10px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Total Points tallies:</span>
                    <strong style={{ color: "var(--text-primary)" }}>{players.reduce((sum, p) => sum + p.points, 0)} pts</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--card-border)", paddingBottom: "10px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Checked-in Attendees:</span>
                    <strong style={{ color: "var(--text-primary)" }}>{tickets.filter(t => t.status === "checked_in").length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--card-border)", paddingBottom: "10px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Pending check-ins:</span>
                    <strong style={{ color: "var(--text-primary)" }}>{tickets.filter(t => t.status === "purchased").length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Active Shop Items:</span>
                    <strong style={{ color: "var(--text-primary)" }}>{products.length} catalog items</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: PLAYERS & SCORES */}
        {activeTab === "players" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "stretch" }}>
              {/* Create Player */}
              <div className="corp-card" style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Add New Player</h2>
                <form onSubmit={handleAddPlayer} style={{ display: "flex", flexDirection: "column", gap: "15px", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Full Name</label>
                      <input 
                        id="new-player-name"
                        type="text" 
                        required 
                        value={newPlayerName} 
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)" }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Email Address</label>
                      <input 
                        id="new-player-email"
                        type="email" 
                        required 
                        value={newPlayerEmail} 
                        onChange={(e) => setNewPlayerEmail(e.target.value)}
                        placeholder="e.g. john@company.com"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)" }}
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Role Type</label>
                      <select 
                        id="new-player-role"
                        value={newPlayerRole} 
                        onChange={(e) => setNewPlayerRole(e.target.value as any)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)", cursor: "pointer" }}
                      >
                        <option value="player">Standard Player</option>
                        <option value="captain">Team Captain</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Team Assignment</label>
                      <select 
                        id="new-player-team"
                        value={newPlayerTeam} 
                        onChange={(e) => setNewPlayerTeam(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)", cursor: "pointer" }}
                      >
                        <option value="">No Team (Free Agent)</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    id="add-player-submit" 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: "100%", padding: "12px", marginTop: "10px", borderRadius: "8px", fontWeight: 700, fontFamily: "var(--font-family)", cursor: "pointer" }}
                  >
                    Create Player Profile
                  </button>
                </form>
              </div>

              {/* Quick Credit by Wallet ID form */}
              <div className="corp-card" style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "15px" }}>Quick Credit by Wallet ID Lookup</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>Issue store vouchers or tournament prize credits by querying their unique wallet ID codes.</p>
                
                {/* If a player matches the ID lookup, show confirmation box immediately at the top */}
                {(() => {
                  const matchedPlayer = players.find(p => p.walletId && p.walletId.toUpperCase() === lookupWalletId.trim().toUpperCase());
                  if (!matchedPlayer) return null;
                  return (
                    <div style={{ marginBottom: '20px', padding: '15px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px dashed var(--accent-primary)', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ✓ Matched Player: <span style={{ color: 'var(--accent-primary)' }}>{matchedPlayer.name}</span> ({matchedPlayer.email})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Current Cash Balance: ₦{matchedPlayer.cashWalletBalance.toLocaleString()} | Voucher Balance: ₦{matchedPlayer.voucherWalletBalance.toLocaleString()}
                      </div>
                    </div>
                  );
                })()}

                <form onSubmit={handleLookupWalletCredit} style={{ display: "flex", flexDirection: "column", gap: "15px", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Wallet ID</label>
                      <input 
                        type="text" 
                        required 
                        value={lookupWalletId} 
                        onChange={(e) => setLookupWalletId(e.target.value)}
                        placeholder="GSH-XXXX-XXXX"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Wallet Type</label>
                        <select 
                          value={lookupWalletType} 
                          onChange={(e) => setLookupWalletType(e.target.value as any)}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)", cursor: "pointer" }}
                        >
                          <option value="voucher">Voucher (Store Credit)</option>
                          <option value="cash">Cash (Withdrawable)</option>
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Amount (₦)</label>
                        <input 
                          type="number" 
                          required 
                          value={lookupWalletAmount} 
                          onChange={(e) => setLookupWalletAmount(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="₦10,000"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)" }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Reason / Description</label>
                      <input 
                        type="text" 
                        value={lookupWalletReason} 
                        onChange={(e) => setLookupWalletReason(e.target.value)}
                        placeholder="e.g. Trivia Mix Winner Prize"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)" }}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", fontWeight: 700, fontFamily: "var(--font-family)", cursor: "pointer" }}
                  >
                    Issue Credit
                  </button>
                </form>
              </div>
            </div>

            {/* List and Scores */}
            <div className="corp-card" style={{ width: "100%" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "25px" }}>Player Scores & Operations</h2>
                
                <div style={{ marginBottom: "20px", position: "relative", maxWidth: "380px" }}>
                  <input 
                    type="text" 
                    placeholder="Search by Player ID, Name, or Email..." 
                    value={playerSearchQuery}
                    onChange={(e) => setPlayerSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 16px 11px 40px",
                      borderRadius: "10px",
                      border: "1px solid var(--card-border)",
                      background: "var(--bg-primary)",
                      outline: "none",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-family)",
                      transition: "border-color 0.2s"
                    }}
                  />
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: "850px" }}>
                    {/* Header Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.2fr 0.6fr 1.2fr 1.2fr 3.3fr", padding: "14px 10px", borderBottom: "2px solid var(--card-border)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, color: "var(--text-secondary)" }}>
                      <div>Player / Player ID</div>
                      <div>Team</div>
                      <div style={{ textAlign: "center" }}>Pts</div>
                      <div style={{ textAlign: "center" }}>Cash Balance</div>
                      <div style={{ textAlign: "center" }}>Voucher Balance</div>
                      <div style={{ textAlign: "right" }}>Actions</div>
                    </div>

                    {/* Body Rows */}
                    {players.filter(p => 
                      p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
                      p.email.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
                      (p.walletId && p.walletId.toLowerCase().includes(playerSearchQuery.toLowerCase()))
                    ).map((p) => (
                      <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.2fr 0.6fr 1.2fr 1.2fr 3.3fr", alignItems: "center", padding: "16px 10px", borderBottom: "1px solid var(--card-border)", color: "var(--text-primary)" }}>
                        
                        {/* Player / ID */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          {getPlayerAvatarSVG(p.avatar || "gamer", 32)}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.email}</div>
                            <code style={{
                              fontSize: "0.75rem",
                              color: "var(--accent-primary)",
                              fontWeight: 700,
                              background: "var(--bg-primary)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              border: "1px solid var(--card-border)",
                              fontFamily: "var(--font-geist-mono), monospace"
                            }}>
                              {p.walletId || "None"}
                            </code>
                          </div>
                        </div>

                        {/* Team */}
                        <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {getTeamName(p.teamId)}
                        </div>

                        {/* Pts */}
                        <div style={{ textAlign: "center", fontWeight: 800, color: "var(--accent-primary)", fontSize: "1.05rem" }}>
                          {p.points}
                        </div>

                        {/* Cash Balance */}
                        <div style={{ textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            background: "#eff6ff",
                            color: "#1e40af",
                            fontSize: "0.85rem",
                            fontWeight: 700
                          }}>
                            ₦{(p.cashWalletBalance || 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Voucher Balance */}
                        <div style={{ textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            background: "#f0fdf4",
                            color: "#166534",
                            fontSize: "0.85rem",
                            fontWeight: 700
                          }}>
                            ₦{(p.voucherWalletBalance || 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                          {p.role !== "admin" && (
                            <button 
                              className="btn-primary" 
                              style={{
                                padding: "6px 12px",
                                fontSize: "0.75rem",
                                background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                                borderColor: "transparent",
                                borderRadius: "8px",
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap"
                              }}
                              onClick={() => setSelectedWalletPlayer(p)}
                            >
                              Manage Wallet
                            </button>
                          )}
                          
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden", background: "white", width: "100px", height: "30px", flexShrink: 0 }}>
                            <button 
                              type="button"
                              style={{ width: "30px", height: "100%", border: "none", background: "#f3f4f6", color: "var(--text-primary)", cursor: "pointer", fontSize: "1rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }} 
                              onClick={() => handleModifyPoints(p.id, -1)}
                            >
                              -
                            </button>
                            <input 
                              type="text" 
                              pattern="[0-9]*"
                              value={pointModifiers[p.id] || ""}
                              placeholder="0"
                              onChange={(e) => setPointModifiers({ ...pointModifiers, [p.id]: parseInt(e.target.value) || 0 })}
                              style={{ width: "40px", height: "100%", border: "none", textAlign: "center", fontSize: "0.85rem", outline: "none", color: "var(--text-primary)", padding: 0, flexShrink: 0 }}
                            />
                            <button 
                              type="button"
                              style={{ width: "30px", height: "100%", border: "none", background: "var(--accent-primary)", color: "white", cursor: "pointer", fontSize: "1rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }} 
                              onClick={() => handleModifyPoints(p.id, 1)}
                            >
                              +
                            </button>
                          </div>

                          <button 
                            className="btn-secondary" 
                            style={{ padding: "8px", fontSize: "0.85rem", color: "#ef4444", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} 
                            onClick={() => handleDeletePlayer(p.id)}
                            title="Delete Player"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ef4444" }}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* TAB 2: TEAMS */}
        {activeTab === "teams" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
            {/* Create Team */}
            <div className="corp-card" style={{ flex: "1 1 300px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Create New Team</h2>
              <form onSubmit={handleAddTeam} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Team Name</label>
                  <input 
                    id="new-team-name"
                    type="text" 
                    required 
                    value={newTeamName} 
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Lagos Chessmasters"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Captain Name</label>
                  <input 
                    id="new-team-captain"
                    type="text" 
                    required 
                    value={newTeamCaptain} 
                    onChange={(e) => setNewTeamCaptain(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Team Logo Symbol</label>
                  <select 
                    id="new-team-logo"
                    value={newTeamLogo} 
                    onChange={(e) => setNewTeamLogo(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", background: "white" }}
                  >
                    <option value="shield">Shield</option>
                    <option value="crown">Crown</option>
                    <option value="target">Target</option>
                  </select>
                </div>

                <button id="add-team-submit" type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }}>Create Team</button>
              </form>
            </div>

            {/* Teams Roster Admin */}
            <div className="corp-card" style={{ flex: "1 1 500px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "25px" }}>Registered Team Groups</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                {teams.map(t => {
                  const teamMembers = players.filter(p => p.teamId === t.id);
                  const teamPoints = teamMembers.reduce((sum, p) => sum + p.points, 0);
                  
                  return (
                    <div key={t.id} className="corp-card" style={{ background: "var(--bg-primary)", display: "flex", flexDirection: "column", padding: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                        <span>{getTeamLogoSVG(t.logo, 40)}</span>
                        <button className="btn-secondary" style={{ border: "none", color: "#ef4444", padding: "5px" }} onClick={() => handleDeleteTeam(t.id)}>🗑️</button>
                      </div>
                      <h3 style={{ fontSize: "1.2", fontWeight: 700, color: "var(--text-primary)", marginBottom: "5px" }}>{t.name}</h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "10px" }}>Captain: {t.captain}</span>
                      
                      <div style={{ marginTop: "auto", borderTop: "1px solid var(--card-border)", paddingTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{teamMembers.length} active players</span>
                        <strong style={{ color: "var(--accent-primary)" }}>{t.points !== undefined ? t.points : teamPoints} pts</strong>
                      </div>
                      <div style={{ marginTop: "12px" }}>
                        <button 
                          className="btn-primary" 
                          style={{ width: "100%", padding: "6px", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                          onClick={() => handleAwardTeamWin(t.id)}
                        >
                          🏆 Award Win (+5 Pts)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transfer & Joining Applications */}
            <div className="corp-card" style={{ flex: "1 1 100%", marginTop: "20px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Pending Roster Transfer Requests</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "25px", fontSize: "0.95rem" }}>
                Review incoming team transfer requests. Approving transfers automatically applies a **4 points deduction adjustment**.
              </p>

              {applications.filter(a => a.status === "pending").length === 0 ? (
                <div style={{ color: "var(--text-secondary)", padding: "30px", textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: "8px" }}>
                  No pending team transfer requests.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                        <th style={{ padding: "12px 10px" }}>Player</th>
                        <th style={{ padding: "12px 10px" }}>Current Team</th>
                        <th style={{ padding: "12px 10px" }}>Destination Team</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Current Score</th>
                        <th style={{ padding: "12px 10px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.filter(a => a.status === "pending").map((app) => {
                        const player = players.find(p => p.id === app.playerId);
                        return (
                          <tr key={app.id} style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-primary)" }}>
                            <td style={{ padding: "15px 10px", fontWeight: 600 }}>{app.playerName}</td>
                            <td style={{ padding: "15px 10px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                              {player ? getTeamName(player.teamId) : "Free Agent"}
                            </td>
                            <td style={{ padding: "15px 10px", fontWeight: 600, color: "var(--accent-primary)" }}>{app.targetTeamName}</td>
                            <td style={{ padding: "15px 10px", textAlign: "center", fontWeight: 700 }}>
                              {player ? player.points : 0} pts
                            </td>
                            <td style={{ padding: "15px 10px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button 
                                  className="btn-primary" 
                                  style={{ padding: "6px 15px", fontSize: "0.8rem" }}
                                  onClick={() => handleApproveApplication(app.id)}
                                >
                                  Approve (-4 Pts)
                                </button>
                                <button 
                                  className="btn-secondary" 
                                  style={{ padding: "6px 15px", fontSize: "0.8rem", color: "#ef4444" }}
                                  onClick={() => handleDeclineApplication(app.id)}
                                >
                                  Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: EVENTS CALENDAR UPGRADE */}
        {activeTab === "events" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
            
            {/* dynamic dynamic scheduler form */}
            <div className="corp-card" style={{ flex: "1 1 400px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Schedule Event</h2>
              <form onSubmit={handleAddEvent} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Event Title</label>
                  <input 
                    id="new-event-title"
                    type="text" 
                    required 
                    value={newEventTitle} 
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g. Lekki Trivia Event"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Event Poster</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewEventPosterUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ flex: "1 1 200px", padding: "8px", fontSize: "0.85rem", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                    />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>or URL:</span>
                    <input 
                      type="url" 
                      value={newEventPosterUrl.startsWith("data:") ? "" : newEventPosterUrl} 
                      onChange={(e) => setNewEventPosterUrl(e.target.value)}
                      placeholder="https://..."
                      style={{ flex: "1 1 200px", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                    />
                  </div>
                  {newEventPosterUrl && (
                    <div style={{ marginTop: "10px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Poster Preview:</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={newEventPosterUrl} 
                        alt="Preview" 
                        style={{ height: "60px", borderRadius: "6px", border: "1px solid var(--card-stroke)", objectFit: "cover" }} 
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Location Venue</label>
                  <input 
                    id="new-event-location"
                    type="text" 
                    required 
                    value={newEventLocation} 
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="e.g. GamesHut Arena, Lekki"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                  />
                </div>

                {/* TIER ROWS SECTION */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Ticket Pricing Tiers</label>
                    <button type="button" className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.75rem" }} onClick={handleAddTierRow}>+ Add Tier</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {newEventTiers.map((tier, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input 
                          type="text" 
                          placeholder="Tier Name (e.g. VIP)" 
                          required
                          value={tier.name}
                          onChange={(e) => handleTierRowChange(idx, "name", e.target.value)}
                          style={{ flex: 2, padding: "8px", borderRadius: "4px", border: "1px solid var(--card-border)", fontSize: "0.85rem" }}
                        />
                        <input 
                          type="number" 
                          placeholder="Price (₦)" 
                          required
                          value={tier.price || ""}
                          onChange={(e) => handleTierRowChange(idx, "price", parseInt(e.target.value) || 0)}
                          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--card-border)", fontSize: "0.85rem" }}
                        />
                        {newEventTiers.length > 1 && (
                          <button type="button" className="btn-secondary" style={{ border: "none", color: "#ef4444", padding: "4px 8px" }} onClick={() => handleRemoveTierRow(idx)}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SESSION ROWS SECTION */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Event Dates & Times (Multi-sessions)</label>
                    <button type="button" className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.75rem" }} onClick={handleAddSessionRow}>+ Add Session</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {newEventSessions.map((sess, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input 
                          type="text" 
                          placeholder="Date (e.g. July 12, 2026)" 
                          required
                          value={sess.date}
                          onChange={(e) => handleSessionRowChange(idx, "date", e.target.value)}
                          style={{ flex: 1.5, padding: "8px", borderRadius: "4px", border: "1px solid var(--card-border)", fontSize: "0.85rem" }}
                        />
                        <input 
                          type="text" 
                          placeholder="Time (e.g. 2:00 PM - 5:00 PM)" 
                          required
                          value={sess.time}
                          onChange={(e) => handleSessionRowChange(idx, "time", e.target.value)}
                          style={{ flex: 1.5, padding: "8px", borderRadius: "4px", border: "1px solid var(--card-border)", fontSize: "0.85rem" }}
                        />
                        {newEventSessions.length > 1 && (
                          <button type="button" className="btn-secondary" style={{ border: "none", color: "#ef4444", padding: "4px 8px" }} onClick={() => handleRemoveSessionRow(idx)}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Description summary</label>
                  <textarea 
                    id="new-event-desc"
                    rows={3} 
                    value={newEventDesc} 
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    placeholder="Enter short event outline"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                  />
                </div>

                <button id="add-event-submit" type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }}>Schedule Event</button>
              </form>
            </div>

            {/* Calendar Events List */}
            <div className="corp-card" style={{ flex: "1 1 450px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "25px" }}>Scheduled Events & Tournaments</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {events.map(ev => (
                  <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--card-border)", padding: "15px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                      {ev.posterUrl ? (
                        <img src={ev.posterUrl} alt="" style={{ width: "50px", height: "50px", borderRadius: "6px", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "50px", height: "50px", borderRadius: "6px", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }} />
                      )}
                      <div>
                        <strong style={{ color: "var(--text-primary)" }}>{ev.title}</strong>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{ev.date} • {ev.time}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Venue: {ev.location}</div>
                        {ev.tiers && ev.tiers.length > 0 && (
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "4px" }}>
                            {ev.tiers.map((t, i) => (
                              <span key={i} style={{ fontSize: "0.7rem", background: "var(--bg-primary)", padding: "2px 6px", borderRadius: "4px", color: "var(--accent-primary)", fontWeight: 700 }}>
                                {t.name}: ₦{t.price.toLocaleString()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="btn-secondary" style={{ border: "none", color: "#ef4444" }} onClick={() => handleDeleteEvent(ev.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CHECK-IN & TICKETS */}
        {activeTab === "tickets" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", alignItems: "flex-start" }}>
            
            {/* Events Selector Directory */}
            <div className="corp-card" style={{ flex: "1 1 300px", padding: "20px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "15px" }}>Event Rosters</h2>
              
              <div style={{ marginBottom: "15px" }}>
                <input 
                  type="text" 
                  placeholder="Search events..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--card-border)", fontSize: "0.85rem" }}
                />
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {events.filter(ev => ev.title.toLowerCase().includes(eventSearchQuery.toLowerCase())).map(ev => {
                  const evStatus = getEventStatus(ev.date);
                  const evTickets = tickets.filter(t => t.eventId === ev.id);
                  const totalTickets = evTickets.reduce((sum, t) => sum + t.quantity, 0);
                  const checkedInTickets = evTickets.filter(t => t.status === "checked_in").reduce((sum, t) => sum + t.quantity, 0);
                  const isSelected = selectedCheckInEventId === ev.id || (!selectedCheckInEventId && ev.id === events[0]?.id);
                  
                  if (!selectedCheckInEventId && events.length > 0) {
                    setSelectedCheckInEventId(events[0].id);
                  }

                  let statusBadge = { bg: "#f3f4f6", color: "#374151", label: "Upcoming" };
                  if (evStatus === "active") statusBadge = { bg: "#d1fae5", color: "#065f46", label: "Active Today" };
                  if (evStatus === "past") statusBadge = { bg: "#fee2e2", color: "#991b1b", label: "Past Event" };

                  return (
                    <div 
                      key={ev.id}
                      onClick={() => setSelectedCheckInEventId(ev.id)}
                      style={{
                        padding: "15px",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid var(--accent-primary)" : "1px solid var(--card-border)",
                        background: isSelected ? "var(--bg-primary)" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", background: statusBadge.bg, color: statusBadge.color, padding: "2px 8px", borderRadius: "8px" }}>
                          {statusBadge.label}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {checkedInTickets}/{totalTickets} Checked In
                        </span>
                      </div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{ev.title}</h4>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{ev.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Event Guestlist */}
            <div className="corp-card" style={{ flex: "1 1 500px", minWidth: "300px" }}>
              {(() => {
                const currentEvent = events.find(ev => ev.id === (selectedCheckInEventId || events[0]?.id));
                if (!currentEvent) {
                  return <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px" }}>No event selected.</div>;
                }

                const evStatus = getEventStatus(currentEvent.date);
                const evTickets = tickets.filter(t => t.eventId === currentEvent.id);
                
                let checkinStatusText = "";
                let alertStyle = {};
                if (evStatus === "active") {
                  checkinStatusText = "Check-In Window Open: You can now check attendees in to award points.";
                  alertStyle = { background: "#e6fffa", borderLeft: "4px solid #319795", color: "#234e52", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "0.85rem" };
                } else if (evStatus === "upcoming") {
                  checkinStatusText = "Check-In Window Locked: Attendance check-ins will unlock on the day of the event.";
                  alertStyle = { background: "#ebf8ff", borderLeft: "4px solid #3182ce", color: "#2b6cb0", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "0.85rem" };
                } else {
                  checkinStatusText = "Check-In Window Closed: This is a past event. Check-in operations are closed.";
                  alertStyle = { background: "#fff5f5", borderLeft: "4px solid #e53e3e", color: "#9b2c2c", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "0.85rem" };
                }

                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                      <div>
                        <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase" }}>Guestlist Registry</span>
                        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>{currentEvent.title}</h2>
                      </div>
                    </div>

                    <div style={alertStyle}>
                      {checkinStatusText}
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <input 
                        type="text" 
                        placeholder="Search guest name or email..."
                        value={ticketSearch}
                        onChange={(e) => setTicketSearch(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--card-border)" }}
                      />
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            <th style={{ padding: "10px 5px" }}>Attendee</th>
                            <th style={{ padding: "10px 5px", textAlign: "center" }}>Qty</th>
                            <th style={{ padding: "10px 5px", textAlign: "center" }}>Status</th>
                            <th style={{ padding: "10px 5px", textAlign: "right" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {evTickets.filter(t => 
                            t.buyerName.toLowerCase().includes(ticketSearch.toLowerCase()) || 
                            t.buyerEmail.toLowerCase().includes(ticketSearch.toLowerCase())
                          ).map((ticket) => (
                            <tr key={ticket.id} style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-primary)", fontSize: "0.9rem" }}>
                              <td style={{ padding: "12px 5px" }}>
                                <div style={{ fontWeight: 600 }}>{ticket.buyerName}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{ticket.buyerEmail}</div>
                                {ticket.tierName && (
                                  <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700 }}>
                                    {ticket.tierName}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "12px 5px", textAlign: "center" }}>{ticket.quantity}</td>
                              <td style={{ padding: "12px 5px", textAlign: "center" }}>
                                {ticket.status === "checked_in" ? (
                                  <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>Checked In</span>
                                ) : (
                                  <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>Purchased</span>
                                )}
                              </td>
                              <td style={{ padding: "12px 5px", textAlign: "right" }}>
                                {ticket.status === "purchased" ? (
                                  <button 
                                    className="btn-primary" 
                                    style={{ 
                                      padding: "6px 12px", 
                                      fontSize: "0.75rem",
                                      background: evStatus === "active" ? "var(--accent-primary)" : "#cbd5e1",
                                      borderColor: evStatus === "active" ? "var(--accent-primary)" : "#cbd5e1",
                                      cursor: evStatus === "active" ? "pointer" : "not-allowed",
                                      color: evStatus === "active" ? "white" : "#64748b"
                                    }}
                                    disabled={evStatus !== "active"}
                                    onClick={() => handleCheckIn(ticket.id)}
                                  >
                                    Check In (+5 Pts)
                                  </button>
                                ) : (
                                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>✓ Checked In</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {evTickets.length === 0 && (
                            <tr>
                              <td colSpan={4} style={{ padding: "30px 5px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>No tickets purchased for this event.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        )}

        {/* TAB 5: SHOP INVENTORY */}
        {activeTab === "shop" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
            {/* Add Product */}
            <div className="corp-card" style={{ flex: "1 1 300px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Add Shop Item</h2>
              <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Item Name</label>
                  <input 
                    id="new-product-name"
                    type="text" 
                    required 
                    value={newProdName} 
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Scrabble Corporate Deluxe"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Price (₦)</label>
                    <input 
                      id="new-product-price"
                      type="number" 
                      required 
                      value={newProdPrice} 
                      onChange={(e) => setNewProdPrice(parseInt(e.target.value) || 0)}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Product Image URL</label>
                    <input 
                      id="new-product-image"
                      type="text" 
                      required 
                      value={newProdImage} 
                      onChange={(e) => setNewProdImage(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontSize: "0.9rem", fontFamily: "var(--font-family)" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Category</label>
                  <select 
                    id="new-product-category"
                    value={newProdCategory} 
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", background: "white" }}
                  >
                    <option value="Board Games">Board Games</option>
                    <option value="Card Games">Card Games</option>
                    <option value="Puzzles">Puzzles</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Item Description</label>
                  <textarea 
                    id="new-product-desc"
                    rows={3} 
                    value={newProdDesc} 
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Enter description outlines"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                  />
                </div>

                <button id="add-product-submit" type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }}>Publish Shop Item</button>
              </form>
            </div>

            {/* Products List */}
            <div className="corp-card" style={{ flex: "1 1 500px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "25px" }}>Published Catalog</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
                {products.map(pr => (
                  <div key={pr.id} className="corp-card" style={{ background: "var(--bg-primary)", display: "flex", flexDirection: "column", padding: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <span>{getProductSVG(pr.image, 32)}</span>
                      <button className="btn-secondary" style={{ border: "none", color: "#ef4444", padding: "3px" }} onClick={() => handleDeleteProduct(pr.id)}>🗑️</button>
                    </div>
                    <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{pr.name}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "10px" }}>{pr.category}</span>
                    <strong style={{ color: "var(--accent-primary)", marginTop: "auto", fontSize: "1rem" }}>₦{pr.price.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SYSTEM SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="corp-card" style={{ border: "1px solid #fca5a5" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#b91c1c", marginBottom: "15px" }}>Critical System Controls</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "30px" }}>
                The actions here modify the state values in localStorage directly. You can wipe all current registrations, score alterations, added events, and product listings, resetting the database to default pitch deck states.
              </p>
              
              <button 
                id="factory-reset-btn"
                className="btn-primary" 
                style={{ background: "#ef4444", borderColor: "#ef4444", width: "100%", padding: "15px", fontSize: "1.1rem" }}
                onClick={handleFactoryReset}
              >
                Factory Reset Database
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: SYSTEM NOTIFICATIONS & INBOX LOGS */}
        {activeTab === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }} className="animate-fade-in">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "40px", alignItems: "start" }}>
              
              {/* Cash Withdrawals Desk */}
              <div className="corp-card" style={{ padding: "30px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "10px" }}>
                  💸 Withdrawal Processing Desk
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "25px" }}>
                  Process player cash-out requests. Declining will instantly refund the money to their cash balance.
                </p>

                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Pending Requests ({withdrawals.filter(w => w.status === "pending").length})
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "35px" }}>
                  {withdrawals.filter(w => w.status === "pending").length === 0 ? (
                    <div style={{ color: "var(--text-secondary)", padding: "20px 0", textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: "8px" }}>
                      No pending withdrawal requests.
                    </div>
                  ) : (
                    withdrawals.filter(w => w.status === "pending").map(w => (
                      <div key={w.id} style={{ border: "1px solid var(--card-border)", padding: "15px", borderRadius: "12px", background: "var(--bg-primary)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                          <div>
                            <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{w.playerName}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                              {new Date(w.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent-primary)" }}>
                            ₦{w.amount.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "15px", background: "white", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}>
                          <strong>Account:</strong> {w.paymentDetails}
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            className="btn-primary"
                            style={{ flex: 1, padding: "8px", fontSize: "0.8rem", borderRadius: "8px", fontFamily: "var(--font-family)", cursor: "pointer" }}
                            onClick={() => handleApproveWithdrawal(w.id)}
                          >
                            Approve Payment
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ flex: 1, padding: "8px", fontSize: "0.8rem", color: "#ef4444", borderColor: "#fecaca", borderRadius: "8px", fontFamily: "var(--font-family)", cursor: "pointer" }}
                            onClick={() => handleDeclineWithdrawal(w.id)}
                          >
                            Decline & Refund
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Processed Transactions
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-secondary)", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Player</th>
                        <th style={{ padding: "8px" }}>Amount</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.filter(w => w.status !== "pending").slice(0, 5).map(w => (
                        <tr key={w.id} style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-primary)" }}>
                          <td style={{ padding: "8px" }}>{w.playerName}</td>
                          <td style={{ padding: "8px", fontWeight: 700 }}>₦{w.amount.toLocaleString()}</td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: w.status === "approved" ? "#d1fae5" : "#fee2e2",
                              color: w.status === "approved" ? "#065f46" : "#991b1b"
                            }}>
                              {w.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {withdrawals.filter(w => w.status !== "pending").length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", padding: "10px", color: "var(--text-secondary)" }}>No processed withdrawals.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Email logs console */}
              <div className="corp-card" style={{ padding: "30px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "10px" }}>
                  ✉️ Email Dispatches & Logs
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "25px" }}>
                  Real-time history of email communications dispatched by the platform.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "600px", overflowY: "auto" }}>
                  {adminEmails.length === 0 ? (
                    <div style={{ color: "var(--text-secondary)", padding: "20px 0", textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: "8px" }}>
                      No emails sent yet.
                    </div>
                  ) : (
                    adminEmails.map(em => (
                      <div key={em.id} style={{ border: "1px solid var(--card-border)", borderRadius: "12px", background: "#0f172a", color: "#f8fafc", overflow: "hidden" }}>
                        <div style={{ background: "#1e293b", padding: "10px 12px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "0.75rem" }}>
                          <div>
                            To: <strong style={{ color: "#f8fafc" }}>{em.recipientName} ({em.recipientEmail})</strong>
                            <div style={{ color: "#38bdf8", marginTop: "2px", fontWeight: 700 }}>Subject: {em.subject}</div>
                          </div>
                          <div style={{ color: "#64748b" }}>
                            {new Date(em.sentAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ padding: "12px", background: "#0f172a", fontSize: "0.8rem", color: "#cbd5e1" }} dangerouslySetInnerHTML={{ __html: em.bodyHtml }} />
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ADMIN OVERLAY 1: MANAGE PLAYER WALLET MODAL */}
      {selectedWalletPlayer && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(5px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1200,
          padding: "20px"
        }}>
          <div className="corp-card animate-fade-in" style={{ maxWidth: "450px", width: "100%", background: "#ffffff", position: "relative", padding: "40px" }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedWalletPlayer(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", color: "var(--text-secondary)" }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "10px" }}>Manage Player Wallet</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {selectedWalletPlayer.name} ({selectedWalletPlayer.email})
            </span>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "var(--bg-primary)", padding: "15px", borderRadius: "8px", margin: "20px 0" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>CASH WALLET</span>
                <strong style={{ fontSize: "1.1rem", color: "#1e3a8a" }}>₦{(selectedWalletPlayer.cashWalletBalance || 0).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>VOUCHER WALLET</span>
                <strong style={{ fontSize: "1.1rem", color: "#166534" }}>₦{(selectedWalletPlayer.voucherWalletBalance || 0).toLocaleString()}</strong>
              </div>
            </div>

            <form onSubmit={handleAdminWalletModify}>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Wallet Balance Type</label>
                  <select 
                    value={adminWalletType} 
                    onChange={(e) => setAdminWalletType(e.target.value as any)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", background: "white" }}
                  >
                    <option value="voucher">Voucher (Store Credit)</option>
                    <option value="cash">Cash (Withdrawable)</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Action</label>
                    <select 
                      value={adminWalletAction} 
                      onChange={(e) => setAdminWalletAction(e.target.value as any)}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", background: "white" }}
                    >
                      <option value="credit">Credit (+)</option>
                      <option value="debit">Debit (-)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Amount (₦)</label>
                    <input 
                      type="number" 
                      required 
                      min={100}
                      value={adminWalletAmount} 
                      onChange={(e) => setAdminWalletAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="₦1,000"
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Reason / Description</label>
                  <input 
                    type="text" 
                    value={adminWalletReason} 
                    onChange={(e) => setAdminWalletReason(e.target.value)}
                    placeholder="e.g. Tournament Winner prize payout"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  type="button"
                  className="btn-secondary" 
                  style={{ flex: 1, padding: "12px" }}
                  onClick={() => setSelectedWalletPlayer(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1, padding: "12px" }}
                >
                  Apply Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
