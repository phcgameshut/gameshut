"use client";
import { showToast } from "@/lib/toast";
import { useState, useEffect } from "react";
import { storage, Team, Player, Application } from "@/lib/storage";
import { getPlayerAvatarSVG } from "../login/page";

const getTeamLogoSVG = (logoKey: string, size = 32) => {
  // Orbit: Planet with Ring (logo: shield)
  if (logoKey === "shield" || logoKey === "orbit") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
        <circle cx="12" cy="12" r="6" />
        <path d="M2 12h20M20.38 10a10 10 0 0 1-16.76 4" />
      </svg>
    );
  }
  // Sunflower: Stylized Sunflower (logo: crown)
  if (logoKey === "crown" || logoKey === "sunflower") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#eab308" }}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5V2M12 22v-3M5 12H2M22 12h-3" />
        <path d="M7.05 7.05L4.93 4.93M19.07 19.07l-2.12-2.12M7.05 16.95l-2.12 2.12M19.07 4.93l-2.12 2.12" />
        <path d="M12 9a3 3 0 0 1 0 6 3 3 0 0 1 0-6" fill="currentColor" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
      </svg>
    );
  }
  // Green Lantern: Classic Lantern (logo: target)
  if (logoKey === "target" || logoKey === "lantern") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#22c55e" }}>
        <path d="M12 2v3M8 5h8M9 5v4M15 5v4" />
        <rect x="6" y="9" width="12" height="10" rx="2" />
        <path d="M12 9v10M6 14h12" />
        <path d="M8 19h8v2H8z" />
      </svg>
    );
  }
  // Red Riot: Fire (logo: sword)
  if (logoKey === "sword" || logoKey === "fire") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ef4444" }}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
};

const getBadgeSVG = (badgeType: string, size = 24) => {
  if (badgeType === "captain") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#eab308" }}>
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      </svg>
    );
  }
  if (badgeType === "free_agent") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#16a34a" }}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      </svg>
    );
  }
  if (badgeType === "tactician") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  }
  if (badgeType === "regular") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#3b82f6" }}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#94a3b8" }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "teams">("leaderboard");
  
  // App States
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Public Transfer Request Modal States
  const [showPublicTransferModal, setShowPublicTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferTargetTeamId, setTransferTargetTeamId] = useState("");
  const [transferReason, setTransferReason] = useState("");

  // Detailed Player Profile Modal
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<Player | null>(null);

  const getDeterministicAvatar = (player: Player) => {
    if (player.avatar) return player.avatar;
    const avatars = ["gamer", "chess", "dice", "mage", "shield", "dragon", "rocket", "alien"];
    let hash = 0;
    const str = player.id || player.name || "";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatars.length;
    return avatars[index];
  };

  // Load from Storage
  useEffect(() => {
    const loadData = async () => {
      await storage.syncFromServer();
      setTeams(storage.getTeams());
      setPlayers(storage.getPlayers());
      setApplications(storage.getApplications());
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Save to Storage on changes
  useEffect(() => {
    if (isLoaded) {
      storage.setPlayers(players);
    }
  }, [players, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      storage.setApplications(applications);
    }
  }, [applications, isLoaded]);

  // Calculate Team points using static values if defined, otherwise fall back to dynamic sum
  const getTeamPoints = (teamId: string) => {
    const matchedTeam = teams.find(t => t.id === teamId);
    if (matchedTeam && typeof matchedTeam.points === "number") {
      return matchedTeam.points;
    }
    return players
      .filter(p => p.teamId === teamId)
      .reduce((sum, p) => sum + p.points, 0);
  };

  // Sorting
  const sortedTeams = [...teams]
    .map(t => ({ ...t, points: getTeamPoints(t.id) }))
    .sort((a, b) => b.points - a.points);
    
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  const handlePublicTransferRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferEmail || !transferTargetTeamId) return;

    const matchedPlayer = players.find(p => p.email.toLowerCase() === transferEmail.toLowerCase());
    if (!matchedPlayer) {
      showToast("No player profile found with that email. Please register on your Profile page first!", "error");
      return;
    }

    const targetTeam = teams.find(t => t.id === transferTargetTeamId);
    if (!targetTeam) return;

    const newApp: Application = {
      id: "app_" + Math.random().toString(36).substr(2, 9),
      playerName: matchedPlayer.name,
      playerId: matchedPlayer.id,
      targetTeamName: targetTeam.name,
      targetTeamId: targetTeam.id,
      status: "pending"
    };

    const updatedApps = [...applications, newApp];
    setApplications(updatedApps);
    storage.setApplications(updatedApps);

    setTransferEmail("");
    setTransferTargetTeamId("");
    setTransferReason("");
    setShowPublicTransferModal(false);
    showToast(`Transfer request submitted successfully for ${matchedPlayer.name} to join ${targetTeam.name}! Please await admin approval.`, "success");
  };

  const getTeamName = (id: string | null) => {
    if (!id) return "Free Agent";
    const team = teams.find(t => t.id === id);
    return team ? team.name : "Free Agent";
  };

  const getPlayerAchievements = (points: number, role: string, teamId: string | null) => {
    const badges = [];
    if (role === "captain") badges.push({ key: "captain", label: "Team Captain", desc: "Coordinates rosters and approves matches" });
    if (!teamId) badges.push({ key: "free_agent", label: "Free Agent", desc: "Available for team roster recruitment" });
    if (points >= 40) {
      badges.push({ key: "tactician", label: "Apex Tactician", desc: "Highest strategy percentile contributor" });
    } else if (points >= 15) {
      badges.push({ key: "regular", label: "Event Regular", desc: "Consistent presence at boardroom strategy events" });
    } else if (points > 0) {
      badges.push({ key: "rookie", label: "Rookie Contributor", desc: "Recently onboarded strategy participant" });
    }
    return badges;
  };

  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: "80px 20px", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}>Loading Standings...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '80px 20px', minHeight: '80vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '60px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
          Leaderboard
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', marginBottom: '30px' }}>
          Real-time individual strategy rankings and team standings.
        </p>

        {/* Tab Controls */}
        <div style={{ display: 'inline-flex', gap: '10px', background: 'var(--bg-primary)', padding: '6px', borderRadius: '12px' }}>
          <button 
            className={activeTab === "leaderboard" ? "btn-primary" : "btn-secondary"} 
            style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
            onClick={() => setActiveTab("leaderboard")}
          >
            Leaderboard
          </button>
          <button 
            className={activeTab === "teams" ? "btn-primary" : "btn-secondary"} 
            style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
            onClick={() => setActiveTab("teams")}
          >
            Teams
          </button>
        </div>
      </div>

      {/* VIEW 1: LEADERBOARD TALLIES */}
      {activeTab === "leaderboard" && (
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }} className="animate-fade-in">
          
          {/* Team Standings */}
          <div className="corp-card" style={{ flex: '1 1 350px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Team Standings
            </h2>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 10px' }}>Rank</th>
                    <th style={{ padding: '12px 10px' }}>Team</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right' }}>Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((team, idx) => (
                    <tr key={team.id} style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                      <td style={{ padding: '16px 10px', fontWeight: 700 }}>#{idx + 1}</td>
                      <td style={{ padding: '16px 10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>{getTeamLogoSVG(team.logo, 24)}</span>
                        <span>{team.name}</span>
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Standings */}
          <div className="corp-card" style={{ flex: '1 1 450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                Individual Standings
              </h2>
              <button 
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setShowPublicTransferModal(true)}
              >
                Request Team Transfer
              </button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              * Click on any player name to view their public profile card, points breakdown, and achievements.
            </p>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 10px' }}>Rank</th>
                    <th style={{ padding: '12px 10px' }}>Player</th>
                    <th style={{ padding: '12px 10px' }}>Team</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.filter(p => p.role !== "admin").slice(0, 20).map((player, idx) => (
                    <tr 
                      key={player.id} 
                      style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => setSelectedPlayerProfile(player)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 10px', fontWeight: 700 }}>#{idx + 1}</td>
                      <td style={{ padding: '16px 10px', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getPlayerAvatarSVG(getDeterministicAvatar(player), 22)}
                        <span>{player.name}</span>
                      </td>
                      <td style={{ padding: '16px 10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {getTeamName(player.teamId)}
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                        {player.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TEAMS DIRECTORY */}
      {activeTab === "teams" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }} className="animate-fade-in">
          {teams.map(team => {
            const teamPoints = getTeamPoints(team.id);
            return (
              <div key={team.id} className="corp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '50%', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                  {getTeamLogoSVG(team.logo, 44)}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '5px' }}>{team.name}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Captain: {team.captain}</span>
                
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '20px' }}>
                  {teamPoints} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>pts</span>
                </div>
                
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '20px', width: '100%', textAlign: 'left', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase' }}>Active Roster</h4>
                  <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {players.filter(p => p.teamId === team.id).map(p => (
                      <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{p.name}</span>
                        <strong>{p.points} pts</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PUBLIC PLAYER PROFILE MODAL */}
      {selectedPlayerProfile && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setSelectedPlayerProfile(null)}
        >
          <div className="corp-card animate-fade-in" style={{ maxWidth: '500px', width: '100%', background: '#ffffff', position: 'relative', padding: '40px' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPlayerProfile(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>

            {/* Profile Header */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
               <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--card-border)' }}>
                 {getPlayerAvatarSVG(getDeterministicAvatar(selectedPlayerProfile), 36)}
               </div>
              <div>
                <span style={{ textTransform: "uppercase", fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 700, letterSpacing: '1px' }}>
                  {selectedPlayerProfile.role} profile
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', marginBottom: '4px' }}>{selectedPlayerProfile.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Player ID: {selectedPlayerProfile.walletId || "None"}</span>
              </div>
            </div>

            {/* Current Standings */}
            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>ASSIGNED TEAM</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{getTeamName(selectedPlayerProfile.teamId)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>TOTAL POINTS</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}>{selectedPlayerProfile.points} pts</strong>
              </div>
            </div>

            {/* Points Contribution Breakdown */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 700 }}>Activity Point Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(() => {
                  const pts = selectedPlayerProfile.points;
                  const attendance = Math.floor(pts / 7) * 5;
                  const booking = Math.floor((pts % 7) / 2) * 2;
                  const gameAction = pts - attendance - booking;

                  return (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Event Bookings (+2 Pts each)</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{booking} pts</strong>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pts > 0 ? (booking / pts) * 100 : 0}%`, height: '100%', background: '#3182ce' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Check-in Attendance (+5 Pts each)</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{attendance} pts</strong>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pts > 0 ? (attendance / pts) * 100 : 0}%`, height: '100%', background: '#38a169' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Action Match Play Modifiers</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{gameAction} pts</strong>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pts > 0 ? (gameAction / pts) * 100 : 0}%`, height: '100%', background: 'var(--accent-primary)' }} />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Achievement Badges */}
            <div style={{ marginBottom: "25px" }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 700 }}>Strategy Achievements</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {getPlayerAchievements(selectedPlayerProfile.points, selectedPlayerProfile.role, selectedPlayerProfile.teamId).map((badge, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span>{getBadgeSVG(badge.key, 26)}</span>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{badge.label}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{badge.desc}</div>
                    </div>
                  </div>
                ))}
                {getPlayerAchievements(selectedPlayerProfile.points, selectedPlayerProfile.role, selectedPlayerProfile.teamId).length === 0 && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Participate in events to earn badges!</span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PUBLIC GUEST TRANSFER REQUEST */}
      {showPublicTransferModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="corp-card animate-fade-in" style={{ maxWidth: '500px', width: '100%', background: '#ffffff', position: 'relative', padding: '40px' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowPublicTransferModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
              Submit Team Transfer Application
            </h3>
            
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
              Transfer Rules Notice
              <br/>
              Public transfer requests require admin review and roster checks. Once approved, the **4-point transfer penalty** will be deducted from your score.
            </div>

            <form onSubmit={handlePublicTransferRequest}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Your Registered Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={transferEmail} 
                    onChange={(e) => setTransferEmail(e.target.value)}
                    placeholder="you@company.com" 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Select Target Team</label>
                  <select 
                    required
                    value={transferTargetTeamId} 
                    onChange={(e) => setTransferTargetTeamId(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'white' }}
                  >
                    <option value="">-- Select Team --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Reason for Transfer (Optional)</label>
                  <textarea 
                    rows={2}
                    value={transferReason} 
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="e.g. Team alignment..." 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', resize: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => setShowPublicTransferModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1, padding: '12px' }}
                  disabled={!transferEmail || !transferTargetTeamId}
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
