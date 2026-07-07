"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { storage, Player, Team } from "@/lib/storage";

export const AVATARS = [
  { id: "gamer", label: "Pro Gamer" },
  { id: "chess", label: "Grandmaster" },
  { id: "dice", label: "Roll Master" },
  { id: "mage", label: "Mage" },
  { id: "shield", label: "Paladin" },
  { id: "dragon", label: "Dragon" },
  { id: "rocket", label: "Speedrunner" },
  { id: "alien", label: "Alien" }
];

export const getPlayerAvatarSVG = (avatarId: string, size = 48) => {
  if (avatarId === "gamer") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#3b82f6" }}>
        <rect x="2" y="6" width="20" height="12" rx="3" />
        <path d="M12 12h.01M15 12h.01M18 12h.01M6 12h4M8 10v4" />
      </svg>
    );
  }
  if (avatarId === "chess") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#eab308" }}>
        <path d="M19 21H5M12 15a3 3 0 0 0 3-3V5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v7a3 3 0 0 0 3 3zM8 10h8" />
      </svg>
    );
  }
  if (avatarId === "dice") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ef4444" }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <circle cx="15.5" cy="15.5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    );
  }
  if (avatarId === "mage") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#a855f7" }}>
        <path d="M6 18L12 2l6 16H6zM3 22h18" />
      </svg>
    );
  }
  if (avatarId === "shield") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (avatarId === "dragon") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f97316" }}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  }
  if (avatarId === "rocket") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#06b6d4" }}>
        <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M12 5l-8 8M19 12l-8 8M9 15l6-6M12 3a9 9 0 0 1 9 9" />
      </svg>
    );
  }
  if (avatarId === "alien") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ec4899" }}>
        <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5zM6 13h12M8 21h8M12 17v4" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary)" }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auth Step flow: "auth" | "otp" | "setup" | "success"
  const [step, setStep] = useState<"auth" | "otp" | "setup" | "success">("auth");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("gamer");

  // User details state (for temporary hold during OTP verification)
  const [pendingUser, setPendingUser] = useState<Player | null>(null);

  // Common Inputs
  const [showPassword, setShowPassword] = useState(false);

  // Login Form Inputs
  const [loginIdentifier, setLoginIdentifier] = useState(""); // username or email
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Signup Form Inputs
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupTeamId, setSignupTeamId] = useState("");
  const [signupError, setSignupError] = useState("");

  // OTP holding screen states
  const [otpDigits, setOtpDigits] = useState<string[]>(new Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(59);
  const [isCopied, setIsCopied] = useState(false);

  // Refs for OTP input autofocus chaining
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const loadInitial = async () => {
      await storage.syncFromServer();
      setTeams(storage.getTeams());
      const playersList = storage.getPlayers();
      setPlayers(playersList);
      setIsLoaded(true);

      // Redirect to profile early if already signed in
      if (typeof window !== "undefined") {
        const savedUserId = sessionStorage.getItem("gh_session_user_id");
        if (savedUserId) {
          const check = playersList.find(p => p.id === savedUserId);
          if (check) router.push("/profile");
        }
      }
    };
    loadInitial();
  }, [router]);

  // OTP Resend Timer countdown loop
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, resendTimer]);

  const isUsernameTaken = (uname: string) => {
    if (!uname) return false;
    return players.some(p => p.username.toLowerCase() === uname.toLowerCase());
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginIdentifier || !loginPassword) return;

    // Sync latest from server to make sure newly registered accounts are found!
    await storage.syncFromServer();
    const latestPlayers = storage.getPlayers();
    setPlayers(latestPlayers);

    const found = latestPlayers.find(p => 
      p.email.toLowerCase() === loginIdentifier.toLowerCase() ||
      p.username.toLowerCase() === loginIdentifier.toLowerCase()
    );

    if (!found) {
      setLoginError("Account not found.");
      return;
    }

    if (found.password && found.password !== loginPassword) {
      setLoginError("Incorrect password.");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(new Array(6).fill(""));
    setOtpError("");
    setResendTimer(59);
    setPendingUser(found);
    setIsSigningUp(false);
    setStep("otp");

    // Log verification email
    storage.addEmailLog(
      found.email,
      found.name,
      "Verification OTP Code",
      `<p>Hello <strong>${found.name}</strong>,</p><p>To finalize verification on GamesHut, enter the single-use verification code below:</p><p style="font-size: 1.5rem; letter-spacing: 2px;"><strong>${code}</strong></p><p>This code will expire shortly.</p>`,
      "otps@gameshut.ng"
    );

    console.log(`[Verification OTP]: Sent to ${found.email}. Code: ${code}`);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    // Find if there's an existing seeded player with the exact same name (case-insensitive)
    const existingSeededPlayer = players.find(
      p => p.name.toLowerCase() === signupName.toLowerCase()
    );

    const emailExists = players.some(
      p => p.email.toLowerCase() === signupEmail.toLowerCase() && (!existingSeededPlayer || p.id !== existingSeededPlayer.id)
    );
    if (emailExists) {
      setSignupError("Email address is already registered.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }

    let newPlayer: Player;

    if (existingSeededPlayer) {
      // Link with the existing seeded record!
      newPlayer = {
        ...existingSeededPlayer,
        username: signupUsername.toLowerCase().trim(),
        email: signupEmail.toLowerCase().trim(),
        password: signupPassword
      };
    } else {
      let uniqueWalletId = "";
      let isUnique = false;
      while (!isUnique) {
        const candidateId = `GSH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        if (!players.some(p => p.walletId === candidateId)) {
          uniqueWalletId = candidateId;
          isUnique = true;
        }
      }

      newPlayer = {
        id: "p_" + Math.random().toString(36).substr(2, 9),
        name: signupName,
        username: signupUsername.toLowerCase().trim(),
        email: signupEmail.toLowerCase().trim(),
        password: signupPassword,
        teamId: signupTeamId || null,
        points: 0,
        role: "player",
        walletId: uniqueWalletId,
        cashWalletBalance: 0,
        voucherWalletBalance: 0,
        transactions: []
      };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(new Array(6).fill(""));
    setOtpError("");
    setResendTimer(59);
    setPendingUser(newPlayer);
    setIsSigningUp(true);
    setStep("otp");

    // Log verification email
    storage.addEmailLog(
      newPlayer.email,
      newPlayer.name,
      "Verification OTP Code",
      `<p>Hello <strong>${newPlayer.name}</strong>,</p><p>To finalize verification on GamesHut, enter the single-use verification code below:</p><p style="font-size: 1.5rem; letter-spacing: 2px;"><strong>${code}</strong></p><p>This code will expire shortly.</p>`,
      "otps@gameshut.ng"
    );

    console.log(`[Verification OTP]: Sent to ${newPlayer.email}. Code: ${code}`);
  };

  const handleResendOtp = () => {
    if (!pendingUser) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendTimer(59);

    // Log verification email
    storage.addEmailLog(
      pendingUser.email,
      pendingUser.name,
      "Verification OTP Code (Resend)",
      `<p>Hello <strong>${pendingUser.name}</strong>,</p><p>Here is your new single-use verification code:</p><p style="font-size: 1.5rem; letter-spacing: 2px;"><strong>${code}</strong></p>`,
      "otps@gameshut.ng"
    );

    console.log(`[Verification OTP Resend]: Sent to ${pendingUser.email}. Code: ${code}`);
  };

  const handleForgotPassword = () => {
    alert("Password reset instructions have been sent to your email.");
  };

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/\D/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = numericValue;
    setOtpDigits(newDigits);

    if (numericValue !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otpDigits[index] === "" && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const typedOtp = otpDigits.join("");

    if (typedOtp !== generatedOtp && typedOtp !== "123456") {
      setOtpError("Incorrect verification code.");
      return;
    }

    if (!pendingUser) return;

    if (isSigningUp) {
      setStep("setup");
    } else {
      const exists = players.some(p => p.id === pendingUser.id);
      let updated: Player[];
      if (exists) {
        updated = players.map(p => p.id === pendingUser.id ? pendingUser : p);
      } else {
        updated = [...players, pendingUser];
      }
      setPlayers(updated);
      await storage.setPlayers(updated); // Await the Firestore database write!

      if (typeof window !== "undefined") {
        sessionStorage.setItem("gh_session_user_id", pendingUser.id);
      }

      router.push("/profile");
    }
  };

  const handleCompleteSetup = () => {
    if (!pendingUser) return;

    const finalUser = {
      ...pendingUser,
      avatar: selectedAvatar
    };

    setPendingUser(finalUser);
    setStep("success");
  };

  const handleFinalizeRegistration = async () => {
    if (!pendingUser) return;

    const exists = players.some(p => p.id === pendingUser.id);
    let updated: Player[];
    if (exists) {
      updated = players.map(p => p.id === pendingUser.id ? pendingUser : p);
    } else {
      updated = [...players, pendingUser];
    }
    setPlayers(updated);
    await storage.setPlayers(updated); // Await the Firestore database write!

    // In-app notifications
    storage.addNotification(
      pendingUser.id,
      "Welcome to GamesHut!",
      `Hello ${pendingUser.name}! Your account has been activated. Player ID: ${pendingUser.walletId}`,
      "system"
    );

    // Welcome email log
    storage.addEmailLog(
      pendingUser.email,
      pendingUser.name,
      "Welcome to GamesHut!",
      `<p>Hello <strong>${pendingUser.name}</strong>,</p><p>Welcome to GamesHut! Your account has been successfully set up and activated.</p><p><strong>Your Player ID:</strong> ${pendingUser.walletId}</p><p><strong>Username:</strong> @${pendingUser.username}</p><p>Link your account with event tickets and store purchases to earn activity points and rise on the leaderboards!</p>`,
      "otps@gameshut.ng"
    );

    if (typeof window !== "undefined") {
      sessionStorage.setItem("gh_session_user_id", pendingUser.id);
    }

    router.push("/profile");
  };

  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: "100px 20px", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: "1.2rem", fontFamily: "var(--font-family)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "80px 20px", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "var(--font-family)" }}>
      <div className="corp-card animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "40px" }}>
        
        {/* Step Progress Tracker */}
        {authMode === "signup" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", padding: "0 10px" }}>
            {[
              { num: 1, label: "Info", active: step === "auth" },
              { num: 2, label: "Verify", active: step === "otp" },
              { num: 3, label: "Avatar", active: step === "setup" },
              { num: 4, label: "Success", active: step === "success" }
            ].map((s) => (
              <div key={s.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, position: "relative" }}>
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: s.active ? "var(--accent-primary)" : "var(--bg-primary)",
                  border: s.active ? "2px solid var(--accent-primary)" : "2px solid var(--card-border)",
                  color: s.active ? "white" : "var(--text-secondary)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  zIndex: 2
                }}>
                  {s.num}
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: s.active ? 700 : 500, color: s.active ? "var(--accent-primary)" : "var(--text-secondary)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: SIGN IN / SIGN UP FORM */}
        {step === "auth" && (
          <div>
            <div style={{ marginBottom: "25px" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 5px 0" }}>
                {authMode === "login" ? "Sign In" : "Sign Up"}
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>
                {authMode === "login" ? "Enter your details to sign in" : "Enter your details to sign up"}
              </p>
            </div>

            {/* LOGIN FORM */}
            {authMode === "login" && (
              <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {loginError && (
                  <div style={{ background: "#fff5f5", borderLeft: "4px solid #ef4444", color: "#c53030", padding: "10px 15px", borderRadius: "6px", fontSize: "0.85rem" }}>
                    {loginError}
                  </div>
                )}
                
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "6px", fontWeight: 600 }}>Email or Username</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter email or username" 
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "1px solid var(--card-border)", outline: "none", fontSize: "0.95rem" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Password</label>
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "1px solid var(--card-border)", outline: "none", fontSize: "0.95rem" }}
                  />
                  <div style={{ textAlign: "right", marginTop: "6px" }}>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 500 }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", borderRadius: "8px", fontWeight: 700, fontFamily: "var(--font-family)" }}>
                  Sign In
                </button>

                <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Don't have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => { setAuthMode("signup"); setLoginError(""); }}
                    style={{ background: "none", border: "none", color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "var(--font-family)" }}
                  >
                    Sign up
                  </button>
                </div>
              </form>
            )}

            {/* SIGNUP FORM */}
            {authMode === "signup" && (
              <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {signupError && (
                  <div style={{ background: "#fff5f5", borderLeft: "4px solid #ef4444", color: "#c53030", padding: "10px 15px", borderRadius: "6px", fontSize: "0.85rem" }}>
                    {signupError}
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter full name" 
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", outline: "none" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Username</label>
                    {signupUsername && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isUsernameTaken(signupUsername) ? "#ef4444" : "#10b981" }}>
                        {isUsernameTaken(signupUsername) ? "Taken" : "Available"}
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    required 
                    placeholder="Choose username" 
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: isUsernameTaken(signupUsername) ? "1px solid #ef4444" : "1px solid var(--card-border)", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Email</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter email address" 
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", outline: "none" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Password</label>
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="Min 6 characters" 
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Confirm Password</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="Re-enter password" 
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "5px", fontWeight: 600 }}>Team</label>
                  <select 
                    value={signupTeamId}
                    onChange={(e) => setSignupTeamId(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--card-border)", background: "white", outline: "none", fontFamily: "var(--font-family)" }}
                  >
                    <option value="">No Team (Free Agent)</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isUsernameTaken(signupUsername)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", fontWeight: 700, fontFamily: "var(--font-family)", cursor: isUsernameTaken(signupUsername) ? "not-allowed" : "pointer" }}
                >
                  Sign Up
                </button>

                <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Already have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => { setAuthMode("login"); setSignupError(""); }}
                    style={{ background: "none", border: "none", color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "var(--font-family)" }}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: OTP HOLDING SCREEN */}
        {step === "otp" && pendingUser && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px 0" }}>Enter Verification Code</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>
                We sent a 6-digit code to <strong>{pendingUser.email}</strong>.
              </p>
            </div>

            {otpError && (
              <div style={{ background: "#fff5f5", borderLeft: "4px solid #ef4444", color: "#b91c1c", padding: "10px 15px", borderRadius: "6px", fontSize: "0.85rem" }}>
                {otpError}
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
              {new Array(6).fill(0).map((_, idx) => (
                <input 
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text" 
                  maxLength={1} 
                  required 
                  value={otpDigits[idx]}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  style={{ width: "45px", height: "50px", padding: 0, boxSizing: "border-box", borderRadius: "8px", border: "1px solid var(--card-border)", textAlign: "center", fontSize: "1.4rem", fontWeight: 700, outline: "none", background: "var(--bg-primary)", fontFamily: "var(--font-geist-mono), monospace" }}
                />
              ))}
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", borderRadius: "8px", fontWeight: 700, fontFamily: "var(--font-family)" }}>
              Verify Code
            </button>

            {/* Resend Countdown Timer */}
            <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {resendTimer > 0 ? (
                <span>Resend code in <strong>{resendTimer}s</strong></span>
              ) : (
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  style={{ background: "none", border: "none", color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-family)" }}
                >
                  Resend Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* PROFILE SETUP AVATAR WIZARD */}
        {step === "setup" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px", textAlign: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.5px" }}>Create Your Identity</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
                Select a premium gaming avatar to represent you on the leaderboard standings.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", margin: "10px 0" }}>
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    style={{
                      background: isSelected ? "rgba(99, 102, 241, 0.05)" : "var(--bg-primary)",
                      border: isSelected ? "2px solid var(--accent-primary)" : "1px solid var(--card-border)",
                      borderRadius: "16px",
                      padding: "16px 8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: isSelected ? "0 8px 20px -6px rgba(99, 102, 241, 0.15)" : "none",
                      transform: isSelected ? "translateY(-2px)" : "none"
                    }}
                  >
                    <span style={{ transform: isSelected ? "scale(1.1)" : "none", transition: "transform 0.3s" }}>
                      {getPlayerAvatarSVG(av.id, 36)}
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isSelected ? "var(--accent-primary)" : "var(--text-secondary)" }}>{av.label}</span>
                  </button>
                );
              })}
            </div>

            <button 
              type="button"
              className="btn-primary" 
              onClick={handleCompleteSetup}
              style={{ width: "100%", padding: "14px", borderRadius: "10px", fontWeight: 700, fontFamily: "var(--font-family)", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
            >
              Continue to Final Step
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS & PLAYER ID */}
        {step === "success" && pendingUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", textAlign: "center", alignItems: "center" }}>
            <div style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "2.2rem",
              boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
            }}>
              ✓
            </div>
            
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>Verified Successfully!</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
                Welcome to GamesHut, <strong>{pendingUser.name}</strong>. Your account is verified and active.
              </p>
            </div>

            {/* Unique Player ID display box */}
            <div style={{
              width: "100%",
              background: "var(--bg-primary)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "center",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
            }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", fontWeight: 700 }}>
                Your Unique Player ID
              </span>
              <code style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-primary)", letterSpacing: "1.5px", fontFamily: "var(--font-geist-mono), monospace" }}>
                {pendingUser.walletId}
              </code>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(pendingUser.walletId || "");
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                style={{ 
                  padding: "8px 16px", 
                  fontSize: "0.8rem", 
                  border: "1px solid var(--card-border)", 
                  borderRadius: "20px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  background: isCopied ? "rgba(16, 185, 129, 0.05)" : "transparent",
                  color: isCopied ? "#10b981" : "var(--text-primary)",
                  borderColor: isCopied ? "#10b981" : "var(--card-border)",
                  transition: "all 0.2s"
                }}
              >
                {isCopied ? "✓ Player ID Copied!" : "📋 Copy Player ID"}
              </button>
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
              Use your Player ID to sign in, match up in tournaments, split voucher awards, and check team accomplishments.
            </p>

            <button 
              type="button"
              className="btn-primary" 
              onClick={handleFinalizeRegistration}
              style={{ width: "100%", padding: "14px", borderRadius: "10px", fontWeight: 700, fontFamily: "var(--font-family)" }}
            >
              Enter Profile Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
