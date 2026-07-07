"use client";
import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";

type Package = {
  name: string;
  price: number;
  description: string;
  maxHours: number;
  includes: string[];
  games: string[];
};

const PACKAGES: Package[] = [
  {
    name: "Standard Package",
    price: 250000,
    description: "Designed for groups of up to 25 participants. Perfect for standard team bonding sessions.",
    maxHours: 5,
    includes: ["1 Dedicated Gamemaster"],
    games: ["Digital Escape Room", "Jigsaw Puzzles", "Team Trivia", "Solo Cup Games", "Squatting Game"]
  },
  {
    name: "Cocktail Package",
    price: 800000,
    description: "Includes a wider variety of hosted games and tactile gaming tables.",
    maxHours: 7,
    includes: ["2 Dedicated Gamemasters", "Tactile & Hosted Games Selection"],
    games: ["Table Tennis / Snooker / Air Hockey (Pick 3)", "Table Soccer, Mockingpost, Bowling (All Included)", "Dart, Jenga, Uno Stacko (All Included)", "Fastest Finger Trivia & Physical Games"]
  },
  {
    name: "Fiesta Package",
    price: 1200000,
    description: "Our premium package featuring digital consoles and virtual reality setups alongside the physical tables.",
    maxHours: 12,
    includes: ["Everything in Cocktail Package", "2 Virtual Reality (VR) Games", "1 Xbox Console", "1 PlayStation 5 Console"],
    games: ["VR Experiences", "Console Games (FIFA, etc.)", "Full access to tactile gaming tables", "Dedicated Gamemasters"]
  }
];

// Helper to generate 30-minute time intervals for dropdowns
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min of [0, 30]) {
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const mStr = min === 0 ? "00" : "30";
      const display = `${h12.toString().padStart(2, '0')}:${mStr} ${ampm}`;
      const value = `${hour.toString().padStart(2, '0')}:${mStr}`;
      options.push({ display, value });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function Booking() {
  const [bookingMode, setBookingMode] = useState<"package" | "custom">("package");
  const [selectedPackageIdx, setSelectedPackageIdx] = useState<number>(0);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1); // 1: Setup, 2: Details & Schedule, 3: Success
  
  // Custom calculator headcount
  const [participants, setParticipants] = useState<number>(30);
  
  // Details Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState<"whatsapp" | "call" | "both">("whatsapp");
  const [prefCommunication, setPrefCommunication] = useState<"email" | "phone" | "both">("both");
  
  // Event times
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("10:00"); // 10:00 AM
  const [endTime, setEndTime] = useState("16:00"); // 4:00 PM (6 hours)
  
  // Calculated metrics
  const [calculatedHours, setCalculatedHours] = useState<number>(6);
  const [totalAmount, setTotalAmount] = useState<number>(250000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic hours calculation helper
  useEffect(() => {
    if (!startTime || !endTime) return;
    
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    let diffMinutes = endMinutes - startMinutes;
    // Handle overnight events
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    
    const diffHours = diffMinutes / 60;
    setCalculatedHours(diffHours);
  }, [startTime, endTime]);

  // Dynamic cost calculation
  useEffect(() => {
    if (bookingMode === "package") {
      setTotalAmount(PACKAGES[selectedPackageIdx].price);
    } else {
      const pricePerPersonPerHour = 2000;
      setTotalAmount(participants * calculatedHours * pricePerPersonPerHour);
    }
  }, [bookingMode, selectedPackageIdx, participants, calculatedHours]);

  // Form Validations
  const validateForm = () => {
    if (!firstName || !lastName || !email || !phone || !eventDate) {
      setErrorMsg("Please fill in all contact and event date fields.");
      return false;
    }

    if (calculatedHours <= 0) {
      setErrorMsg("Event end time must be after the start time.");
      return false;
    }

    if (bookingMode === "package") {
      const selectedPkg = PACKAGES[selectedPackageIdx];
      if (calculatedHours > selectedPkg.maxHours) {
        setErrorMsg(`The ${selectedPkg.name} has a strict limit of ${selectedPkg.maxHours} hours. Your selected duration is ${calculatedHours} hours.`);
        return false;
      }
    }

    setErrorMsg(null);
    return true;
  };

  const handleProceedToDetails = () => {
    setWizardStep(2);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsProcessing(true);
    // Mock Paystack checkout flow
    setTimeout(() => {
      // Find matching player
      const playersList = storage.getPlayers();
      const matched = playersList.find(p => p.email.toLowerCase() === email.toLowerCase());
      const packageName = bookingMode === "package" ? PACKAGES[selectedPackageIdx].name : `Custom Event (${participants} guests)`;

      if (matched) {
        storage.addNotification(
          matched.id,
          "Event Booking Confirmed",
          `Your reservation for "${packageName}" on ${eventDate} was successfully booked! Download your PDF pass from the simulated email inbox.`,
          "ticket"
        );
      }

      // Notify admin
      storage.addNotification(
        "admin",
        "New Event Booking",
        `New booking of ₦${totalAmount.toLocaleString()} received from ${firstName} ${lastName} (${email}) for "${packageName}".`,
        "ticket"
      );

      // Simulated email log
      storage.addEmailLog(
        email,
        `${firstName} ${lastName}`,
        `Booking Confirmed: ${packageName}`,
        `<h3>Your Event Booking is Confirmed!</h3><p>Hello <strong>${firstName}</strong>,</p><p>We are excited to host your upcoming event! Here are your booking details:</p><ul><li><strong>Event Date:</strong> ${eventDate}</li><li><strong>Hours:</strong> ${startTime} - ${endTime} (${calculatedHours} hours)</li><li><strong>Package:</strong> ${packageName}</li><li><strong>Total Paid:</strong> ₦${totalAmount.toLocaleString()}</li></ul><p>Download your ticket pass: <a href="#" style="color:#2563eb;font-weight:bold;text-decoration:none;">PDF Ticket Pass Download Link</a></p>`
      );

      setIsProcessing(false);
      setWizardStep(3);
    }, 2000);
  };

  // Get current date to disable past dates
  const todayStr = new Date().toISOString().split("T")[0];

  if (wizardStep === 3) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="corp-card animate-fade-in" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#16a34a' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
            Reservation Sent!
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '30px' }}>
            Thank you, <strong>{firstName}</strong>. Your booking for {bookingMode === "package" ? PACKAGES[selectedPackageIdx].name : `Custom Event (${participants} guests)`} has been successfully registered. 
            A confirmation has been sent to <strong>{email}</strong>. Our team will reach out to you via your preferred channel (**{prefCommunication}**) shortly.
          </p>
          <button className="btn-primary" onClick={() => {
            setWizardStep(1);
            setFirstName("");
            setLastName("");
            setEmail("");
            setPhone("");
            setErrorMsg(null);
          }}>Make Another Reservation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding">
      <div style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }} className="animate-fade-in">
        
        {/* Wizard Progress Track */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '20px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--card-border)',
          padding: '10px 24px',
          borderRadius: '30px',
          marginBottom: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          fontFamily: 'var(--font-family)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: wizardStep === 1 ? 'var(--color-brand)' : '#e2e8f0',
              color: wizardStep === 1 ? 'white' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>1</span>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: wizardStep === 1 ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}>Setup</span>
          </div>

          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: wizardStep === 2 ? 'var(--color-brand)' : '#e2e8f0',
              color: wizardStep === 2 ? 'white' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>2</span>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: wizardStep === 2 ? 'var(--text-primary)' : 'var(--text-secondary)',
              opacity: wizardStep >= 2 ? 1 : 0.6
            }}>Details &amp; Schedule</span>
          </div>
        </div>

        <h1 className="section-title">Reserve Your Games Experience</h1>
        <p className="section-subtitle">
          Choose from our pre-curated corporate packages or calculate a custom rate for larger groups and custom events.
        </p>

        {wizardStep === 1 ? (
          /* STEP 1: SELECT PACKAGE OR CUSTOM GUESTS */
          <div>
            {/* Mode Selector */}
            <div className="booking-mode-select" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '50px' }}>
              <button 
                className={bookingMode === "package" ? "btn-primary" : "btn-secondary"}
                onClick={() => setBookingMode("package")}
              >
                Curated Packages
              </button>
              <button 
                className={bookingMode === "custom" ? "btn-primary" : "btn-secondary"}
                onClick={() => setBookingMode("custom")}
              >
                Custom Event Calculator
              </button>
            </div>

            {bookingMode === "package" ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', textAlign: 'left', marginBottom: '50px' }}>
                {PACKAGES.map((pkg, idx) => (
                  <div 
                    key={idx} 
                    className="corp-card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: selectedPackageIdx === idx ? '2px solid var(--color-brand)' : '1px solid var(--card-border)',
                      cursor: 'pointer',
                      transform: selectedPackageIdx === idx ? 'translateY(-5px)' : 'none',
                      boxShadow: selectedPackageIdx === idx ? '0 10px 25px rgba(0,0,0,0.05)' : 'var(--card-shadow)'
                    }}
                    onClick={() => setSelectedPackageIdx(idx)}
                  >
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>{pkg.name}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand)', marginBottom: '5px' }}>
                      ₦{pkg.price.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-orange)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '20px' }}>
                      Limit: Max {pkg.maxHours} Hours
                    </span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '25px' }}>
                      {pkg.description}
                    </p>
                    
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: 700 }}>Includes</h4>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '20px' }}>
                      {pkg.includes.map((inc, i) => <li key={i}>{inc}</li>)}
                    </ul>

                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: 700 }}>Game Lineup</h4>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '30px' }}>
                      {pkg.games.map((game, i) => <li key={i}>{game}</li>)}
                    </ul>

                    <button 
                      className={selectedPackageIdx === idx ? "btn-primary" : "btn-secondary"} 
                      style={{ width: '100%', marginTop: 'auto' }}
                    >
                      {selectedPackageIdx === idx ? "Selected" : "Select Package"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="corp-card" style={{ padding: '40px', textAlign: 'left', maxWidth: '800px', margin: '0 auto 50px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '15px', fontSize: '1.1rem' }}>
                    Number of Participants: <span style={{ color: 'var(--color-brand)', fontSize: '1.4rem', marginLeft: '10px' }}>{participants} People</span>
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="300" 
                    value={participants} 
                    onChange={(e) => setParticipants(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-brand)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>
                    <span>5</span>
                    <span>300+</span>
                  </div>
                </div>
              </div>
            )}

            <div className="corp-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '30px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Selected Tier:</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {bookingMode === "package" ? PACKAGES[selectedPackageIdx].name : "Custom Event Package"}
                </h3>
              </div>
              <button className="btn-primary" onClick={handleProceedToDetails}>
                Proceed to Details & Time &rarr;
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: USER DETAILS & TIMES FORM WITH SIDEBAR REVIEW */
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', textAlign: 'left', alignItems: 'flex-start' }}>
            
            {/* Form */}
            <form onSubmit={handleCheckout} className="corp-card" style={{ flex: '1 1 600px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '30px' }}>
                Event & Contact Details
              </h2>

              {errorMsg && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444', padding: '15px', borderRadius: '8px', marginBottom: '25px', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              {/* Name Fields */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="First Name" 
                  />
                </div>
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Last Name" 
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                  />
                </div>
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="+234..." 
                  />
                  
                  {/* Clean, Corporate Segmented Button Group (No emojis) */}
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>This number reaches:</span>
                    <div style={{ display: 'flex', border: '1px solid var(--card-stroke)', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
                      {[
                        { id: "whatsapp", label: "WhatsApp" },
                        { id: "call", label: "Calls Only" },
                        { id: "both", label: "Both" }
                      ].map((type, i) => {
                        const isActive = phoneType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setPhoneType(type.id as any)}
                            style={{
                              padding: '8px 18px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              background: isActive ? 'var(--color-brand)' : '#ffffff',
                              color: isActive ? '#ffffff' : 'var(--text-secondary)',
                              border: 'none',
                              borderRight: i < 2 ? '1px solid var(--card-stroke)' : 'none',
                              borderRadius: 0,
                              boxShadow: 'none',
                              cursor: 'pointer',
                              transition: 'background 0.2s ease, color 0.2s ease'
                            }}
                          >
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-orange)', marginTop: '8px', fontWeight: 700 }}>
                      * WhatsApp is highly preferred for sharing coordination setups!
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode of Communication preference */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Preferred Communication Channel</label>
                <select 
                  value={prefCommunication} 
                  onChange={(e) => setPrefCommunication(e.target.value as any)}
                >
                  <option value="both">Both (Email & Phone)</option>
                  <option value="email">Email Only</option>
                  <option value="phone">Phone / WhatsApp Only</option>
                </select>
              </div>

              {/* Time scheduling parameters with styled calendar container */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px', borderTop: '1px solid var(--card-stroke)', paddingTop: '20px' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Event Date</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </span>
                    <input 
                      type="date" 
                      required 
                      min={todayStr}
                      value={eventDate} 
                      onChange={(e) => setEventDate(e.target.value)} 
                      style={{
                        padding: '12px 18px 12px 42px',
                        borderRadius: '12px',
                        border: '1px solid var(--card-stroke)',
                        background: '#ffffff',
                        fontWeight: 600,
                        width: '100%'
                      }}
                    />
                  </div>
                </div>
                
                {/* Premium Dropdown Start Time */}
                <div style={{ flex: '1 1 180px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Start Time</label>
                  <select 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {TIME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.display}</option>
                    ))}
                  </select>
                </div>

                {/* Premium Dropdown End Time */}
                <div style={{ flex: '1 1 180px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>End Time</label>
                  <select 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    {TIME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.display}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculated Statistics block */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--card-stroke)', marginBottom: '35px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calculated Duration:</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '3px' }}>
                    {calculatedHours} Hours
                  </div>
                </div>
                {bookingMode === "package" ? (
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Package Limit Check:</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: calculatedHours > PACKAGES[selectedPackageIdx].maxHours ? '#ef4444' : 'var(--color-teal)', marginTop: '5px' }}>
                      {calculatedHours > PACKAGES[selectedPackageIdx].maxHours 
                        ? `Exceeds max of ${PACKAGES[selectedPackageIdx].maxHours} hrs` 
                        : `Within ${PACKAGES[selectedPackageIdx].maxHours} hrs limit`}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Custom Rate Calculation:</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '5px' }}>
                      ₦2,000 * {participants} guests * {calculatedHours} hrs
                    </div>
                  </div>
                )}
              </div>

              {/* Summary & Submit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '25px', borderTop: '1px solid var(--card-stroke)', paddingTop: '25px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Cost Estimate</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '3px' }}>
                    ₦{totalAmount.toLocaleString()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setWizardStep(1)}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isProcessing}
                    style={{ opacity: isProcessing ? 0.7 : 1 }}
                  >
                    {isProcessing ? 'Processing Payment...' : 'Pay with Paystack'}
                  </button>
                </div>
              </div>
            </form>

            {/* Sidebar Review Panel (Enclosed details showing fully) */}
            <div className="corp-card" style={{ flex: '1 1 300px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-stroke)', paddingBottom: '15px', marginBottom: '20px' }}>
                Selected Review
              </h3>

              {bookingMode === "package" ? (
                <>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand)', marginBottom: '8px' }}>
                    {PACKAGES[selectedPackageIdx].name}
                  </h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
                    ₦{PACKAGES[selectedPackageIdx].price.toLocaleString()}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
                    {PACKAGES[selectedPackageIdx].description}
                  </p>

                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 700 }}>Inclusions</h5>
                  <ul style={{ paddingLeft: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '20px' }}>
                    {PACKAGES[selectedPackageIdx].includes.map((inc, i) => <li key={i}>{inc}</li>)}
                  </ul>

                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 700 }}>Enclosed Games</h5>
                  <ul style={{ paddingLeft: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {PACKAGES[selectedPackageIdx].games.map((game, i) => <li key={i}>{game}</li>)}
                  </ul>
                </>
              ) : (
                <>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand)', marginBottom: '8px' }}>
                    Custom Event Plan
                  </h4>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
                    ₦2,000 / person / hour
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Bespoke setup designed dynamically around your headcount and timeline parameters.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 2 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <strong>Headcount:</strong> {participants} People
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <strong>Duration:</strong> {calculatedHours} Hours
                    </li>
                  </ul>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
