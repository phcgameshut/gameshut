"use client";
import { useState, useEffect } from "react";
import { storage, getEmailTemplateHtml } from "@/lib/storage";

type Package = {
  name: string;
  description: string;
  maxHours: number;
  includes: string[];
  games: string[];
};

const PACKAGES: Package[] = [
  {
    name: "Standard Package",
    description: "Bespoke matchmaking and gamemaster coordination for local tournaments, school challenges, and casual strategy groups.",
    maxHours: 5,
    includes: ["1 Dedicated Gamemaster"],
    games: ["Digital Escape Room", "Jigsaw Puzzles", "Team Trivia", "Solo Cup Games", "Squatting Game"]
  },
  {
    name: "Cocktail Package",
    description: "Full-scale corporate team offsites designed to test collaboration, break silos, and foster team cohesion with customized tactical props.",
    maxHours: 7,
    includes: ["2 Dedicated Gamemasters", "Tactile & Hosted Games Selection"],
    games: ["Table Tennis / Snooker / Air Hockey (Pick 3)", "Table Soccer, Mockingpost, Bowling (All Included)", "Dart, Jenga, Uno Stacko (All Included)", "Fastest Finger Trivia & Physical Games"]
  },
  {
    name: "Fiesta Package",
    description: "Large-scale arena entertainment including console gaming, virtual reality setups, and live scoreboard tournament integration.",
    maxHours: 12,
    includes: ["Everything in Cocktail Package", "2 Virtual Reality (VR) Games", "1 Xbox Console", "1 PlayStation 5 Console"],
    games: ["VR Experiences", "Console Games (FIFA, etc.)", "Full access to tactile gaming tables", "Dedicated Gamemasters"]
  }
];

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
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1); // 1: Setup/Form, 2: Details & Schedule (Packages only), 3: Success
  
  // Package Booking Details Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("14:00");
  const [prefCommunication, setPrefCommunication] = useState<"WhatsApp" | "Email" | "Phone Call">("WhatsApp");
  const [notes, setNotes] = useState("");

  // Custom Event Inquiry Form
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customPrefCommunication, setCustomPrefCommunication] = useState<"WhatsApp" | "Email" | "Phone Call">("WhatsApp");
  const [customDescription, setCustomDescription] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync index from query parameter if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      const idxParam = params.get("idx");
      if (modeParam === "package") {
        setBookingMode("package");
        if (idxParam) {
          const idx = parseInt(idxParam);
          if (idx >= 0 && idx < PACKAGES.length) {
            setSelectedPackageIdx(idx);
          }
        }
      } else if (modeParam === "custom") {
        setBookingMode("custom");
      }
    }
  }, []);

  const validatePackageForm = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !eventDate) {
      setErrorMsg("Please fill out all required fields.");
      return false;
    }
    
    // Check operating hours
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    if (endHour <= startHour) {
      setErrorMsg("End time must be after the start time.");
      return false;
    }

    const duration = endHour - startHour;
    const maxAllowed = PACKAGES[selectedPackageIdx].maxHours;
    if (duration > maxAllowed) {
      setErrorMsg(`The selected package allows a maximum duration of ${maxAllowed} hours. Your request is ${duration} hours.`);
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const validateCustomForm = () => {
    if (!customName.trim() || !customEmail.trim() || !customPhone.trim() || !customDate || !customDescription.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePackageForm()) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const packageName = PACKAGES[selectedPackageIdx].name;
      const clientName = `${firstName} ${lastName}`;

      // Notify admin
      storage.addNotification(
        "admin",
        "New Package Inquiry",
        `New package inquiry received from ${clientName} (${email}) for "${packageName}". Details routed to phcgameshut@gmail.com.`,
        "system"
      );

      const htmlBodyAdmin = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 15px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; font-family: 'Outfit', sans-serif;">Inquiry Details</h4>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Selected Package:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${packageName}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Client Name:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Email Address:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${email}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Phone Number:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${phone}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Preferred Date:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${eventDate}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Schedule Duration:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${startTime} to ${endTime}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Communication Mode:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${prefCommunication}</td>
            </tr>
          </table>
          <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <strong style="display: block; margin-bottom: 5px; color: #0f172a;">Inquiry Notes:</strong>
            <p style="margin: 0; color: #334155; line-height: 1.5; font-style: italic;">${notes || "None provided"}</p>
          </div>
        </div>
      `;

      const htmlBodyClient = `
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 1.6;">
          We've received your booking inquiry for the <strong>${packageName}</strong>! Our team is currently reviewing the details, and we will get back to you within 2 hours via <strong>${prefCommunication}</strong>.
        </p>
        ${htmlBodyAdmin}
        <p style="margin: 20px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.5; text-align: center;">
          Thank you for choosing GamesHut. We look forward to planning your event!
        </p>
      `;

      const wrappedAdminHtml = getEmailTemplateHtml("New Booking Enquiry", "Curated Package Inquiry Received", htmlBodyAdmin);
      const wrappedClientHtml = getEmailTemplateHtml("Inquiry Confirmation", `Hello ${clientName},`, htmlBodyClient);

      // Save Email Log (To Admin)
      storage.addEmailLog(
        "phcgameshut@gmail.com",
        "GamesHut PHC HQ",
        "New Booking Enquiry",
        wrappedAdminHtml,
        email
      );

      // Save Email Log (To Client Confirmation Copy)
      storage.addEmailLog(
        email,
        clientName,
        "Inquiry Confirmation - GamesHut",
        wrappedClientHtml,
        "notifications@gameshut.ng"
      );

      setIsProcessing(false);
      setWizardStep(3);
    }, 1500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCustomForm()) return;

    setIsProcessing(true);

    setTimeout(() => {
      // Notify admin
      storage.addNotification(
        "admin",
        "New Custom Event Inquiry",
        `New custom event inquiry received from ${customName} (${customEmail}). Details routed to phcgameshut@gmail.com.`,
        "system"
      );

      const htmlBodyAdmin = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 15px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; font-family: 'Outfit', sans-serif;">Inquiry Details</h4>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Client Name:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${customName}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Email Address:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${customEmail}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Phone Number:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${customPhone}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Proposed Date:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${customDate}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px; color: #64748b;">Preferred Contact:</td>
              <td style="padding-bottom: 10px; color: #0f172a; font-weight: 700; text-align: right;">${customPrefCommunication}</td>
            </tr>
          </table>
          <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <strong style="display: block; margin-bottom: 5px; color: #0f172a;">Inquiry Notes:</strong>
            <p style="margin: 0; color: #334155; line-height: 1.5; font-style: italic; white-space: pre-wrap;">${customDescription}</p>
          </div>
        </div>
      `;

      const htmlBodyClient = `
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #334155; line-height: 1.6;">
          We've received your custom board game event inquiry! Our team is currently reviewing the details, and we will get back to you within 2 hours via your preferred contact method (<strong>${customPrefCommunication}</strong>).
        </p>
        ${htmlBodyAdmin}
        <p style="margin: 20px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.5; text-align: center;">
          Thank you for choosing GamesHut. We look forward to planning your event!
        </p>
      `;

      const wrappedAdminHtml = getEmailTemplateHtml("New Booking Enquiry", "Custom Event Inquiry Received", htmlBodyAdmin);
      const wrappedClientHtml = getEmailTemplateHtml("Inquiry Confirmation", `Hello ${customName},`, htmlBodyClient);

      // Save Email Log (To Admin)
      storage.addEmailLog(
        "phcgameshut@gmail.com",
        "GamesHut PHC HQ",
        "New Booking Enquiry",
        wrappedAdminHtml,
        customEmail
      );

      // Save Email Log (To Client Copy)
      storage.addEmailLog(
        customEmail,
        customName,
        "Inquiry Confirmation - GamesHut",
        wrappedClientHtml,
        "notifications@gameshut.ng"
      );

      setIsProcessing(false);
      setWizardStep(3);
    }, 1500);
  };

  // Get current date to disable past dates
  const todayStr = new Date().toISOString().split("T")[0];

  if (wizardStep === 3) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="corp-card animate-fade-in" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#16a34a' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
            Inquiry Received!
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '15px' }}>
            Thank you for reaching out to GamesHut. Your request has been successfully registered and routed to our team.
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '30px', fontWeight: 600 }}>
            Our team is currently reviewing it and we'll get back to you within 2 hours!
          </p>
          <button className="btn-primary" onClick={() => {
            setWizardStep(1);
            setFirstName("");
            setLastName("");
            setEmail("");
            setPhone("");
            setNotes("");
            setCustomName("");
            setCustomEmail("");
            setCustomPhone("");
            setCustomDescription("");
            setErrorMsg(null);
          }}>Make Another Inquiry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding animate-fade-in">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Wizard Progress Steps (Only visible for Packages setup) */}
        {bookingMode === "package" && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center', marginBottom: '45px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--color-brand)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>1</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Select Package</span>
            </div>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" style={{ opacity: 0.5 }}>
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
        )}

        <h1 className="section-title">Reach Out For An Experience</h1>
        <p className="section-subtitle">
          Inquire about our pre-curated gaming packages or send a custom support inquiry for your upcoming strategy event.
        </p>

        {/* Tab Mode Selector */}
        <div className="booking-mode-select" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '50px' }}>
          <button 
            className={bookingMode === "package" ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              setBookingMode("package");
              setWizardStep(1);
              setErrorMsg(null);
            }}
          >
            Curated Packages
          </button>
          <button 
            className={bookingMode === "custom" ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              setBookingMode("custom");
              setWizardStep(1);
              setErrorMsg(null);
            }}
          >
            Custom Event Inquiry
          </button>
        </div>

        {/* MODE 1: CURATED PACKAGES FLOW */}
        {bookingMode === "package" && wizardStep === 1 && (
          <div>
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
                    boxShadow: selectedPackageIdx === idx ? '0 10px 25px rgba(0,0,0,0.05)' : 'var(--card-shadow)',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedPackageIdx(idx)}
                >
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>{pkg.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-orange)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '20px', display: 'block' }}>
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

            <div className="corp-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '30px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Selected Package:</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {PACKAGES[selectedPackageIdx].name}
                </h3>
              </div>
              <button className="btn-primary" onClick={() => setWizardStep(2)}>
                Proceed to Details &rarr;
              </button>
            </div>
          </div>
        )}

        {/* PACKAGE DETAILS FORM (STEP 2) */}
        {bookingMode === "package" && wizardStep === 2 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', textAlign: 'left', alignItems: 'flex-start' }}>
            
            <form onSubmit={handlePackageSubmit} className="corp-card" style={{ flex: '1 1 600px' }}>
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
                    className="form-control"
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="First Name" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                  />
                </div>
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Last Name</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Last Name" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="form-control"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@example.com" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                  />
                </div>
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    className="form-control"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="e.g. +234..." 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                  />
                </div>
              </div>

              {/* Date & Time Schedule */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Preferred Date</label>
                  <input 
                    type="date" 
                    required 
                    className="form-control"
                    min={todayStr} 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                  />
                </div>
                
                <div style={{ flex: '1 1 120px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Start Time</label>
                  <select 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                  >
                    {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.display}</option>)}
                  </select>
                </div>

                <div style={{ flex: '1 1 120px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>End Time</label>
                  <select 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                  >
                    {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.display}</option>)}
                  </select>
                </div>
              </div>

              {/* Preferred Communication Mode */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 700 }}>Preferred Contact Method</label>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {(["WhatsApp", "Email", "Phone Call"] as const).map(mode => (
                    <label key={mode} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="radio" 
                        name="prefCommunication" 
                        checked={prefCommunication === mode} 
                        onChange={() => setPrefCommunication(mode)}
                        style={{ accentColor: 'var(--color-brand)' }}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>

              {/* Extra Notes */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Inquiry Notes</label>
                <textarea 
                  rows={4} 
                  placeholder="Tell us about your event, estimated head count, preferred location, and all of that..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              {/* Submit Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid var(--card-stroke)', paddingTop: '25px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setWizardStep(1)}
                  style={{ padding: '12px 24px' }}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isProcessing}
                  style={{ opacity: isProcessing ? 0.7 : 1, padding: '12px 30px' }}
                >
                  {isProcessing ? 'Submitting...' : 'Reach Out to Us'}
                </button>
              </div>
            </form>

            {/* Sidebar Review Panel (No Prices) */}
            <div className="corp-card" style={{ flex: '1 1 300px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-stroke)', paddingBottom: '15px', marginBottom: '20px' }}>
                Inquiry Details
              </h3>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand)', marginBottom: '15px' }}>
                {PACKAGES[selectedPackageIdx].name}
              </h4>
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
            </div>

          </div>
        )}

        {/* MODE 2: CUSTOM EVENT INQUIRY FORM (DIRECT FORM) */}
        {bookingMode === "custom" && (
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>
            <form onSubmit={handleCustomSubmit} className="corp-card" style={{ padding: '40px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Custom Event Inquiry Form
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '30px', lineHeight: 1.5 }}>
                Fill out the form below to share details about your target event concept. Our PHC team will coordinate a custom proposal and reply to you via your preferred communication channel.
              </p>

              {errorMsg && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444', padding: '15px', borderRadius: '8px', marginBottom: '25px', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Full Name"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="e.g. +234..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Event Date</label>
                <input 
                  type="date" 
                  required 
                  min={todayStr}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              {/* Preferred Communication Mode */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 700 }}>Preferred Contact Method</label>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {(["WhatsApp", "Email", "Phone Call"] as const).map(mode => (
                    <label key={mode} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="radio" 
                        name="customPrefCommunication" 
                        checked={customPrefCommunication === mode} 
                        onChange={() => setCustomPrefCommunication(mode)}
                        style={{ accentColor: 'var(--color-brand)' }}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>Inquiry Notes</label>
                <textarea 
                  rows={5} 
                  required
                  placeholder="Describe your event format, estimated head count, location, and general support specifications..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isProcessing}
                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, opacity: isProcessing ? 0.7 : 1 }}
              >
                {isProcessing ? 'Sending Inquiry...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
