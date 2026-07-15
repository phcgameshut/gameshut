"use client";
import { useState, useEffect } from "react";
import { storage, GameEvent, Player, Ticket } from "@/lib/storage";

const loadPaystack = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Events() {
  const [eventTab, setEventTab] = useState<"upcoming" | "past" | "passes">("upcoming");
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Booking Modal States
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [ticketQty, setTicketQty] = useState<number | "">(1);
  const [assignMode, setAssignMode] = useState<"me" | "others">("me");

  // Helper functions for history pushState
  const selectEvent = (ev: GameEvent) => {
    setSelectedEvent(ev);
    setSelectedTierName(ev.tiers && ev.tiers.length > 0 ? ev.tiers[0].name : "General Entry");
    setSelectedSessionIndex(0);
    setTicketQty(1);
    setAttendeeDetails([{ name: "", email: "" }]);
    if (typeof window !== "undefined") {
      window.history.pushState({ eventId: ev.id }, "", `/events?id=${ev.id}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const deselectEvent = () => {
    setSelectedEvent(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/events");
    }
  };

  // Synchronize event select with URL search params so browser back/forward buttons work
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const evId = params.get("id");
      if (evId) {
        const found = events.find(e => e.id === evId);
        if (found) {
          setSelectedEvent(found);
          setSelectedTierName(found.tiers && found.tiers.length > 0 ? found.tiers[0].name : "General Entry");
          setSelectedSessionIndex(0);
          setTicketQty(1);
          setAttendeeDetails([{ name: "", email: "" }]);
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }
      }
      setSelectedEvent(null);
    };

    window.addEventListener("popstate", handlePopState);
    if (isLoaded && events.length > 0) {
      handlePopState();
    }
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isLoaded, events]);
  
  // Custom Tiers & Sessions states
  const [selectedTierName, setSelectedTierName] = useState("");
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);

  // Dynamic attendee names for multiple tickets
  const [attendeeDetails, setAttendeeDetails] = useState<{ name: string; email: string }[]>([
    { name: "", email: "" }
  ]);

  // Wallet Lookup States
  const [walletEmail, setWalletEmail] = useState("");
  const [searchedTickets, setSearchedTickets] = useState<Ticket[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ names: [] as string[], count: 0, total: 0 });

  // Load calendar events
  useEffect(() => {
    const loadData = async () => {
      await storage.syncFromServer();
      setEvents(storage.getEvents());
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Update dynamic inputs when ticket quantity shifts
  useEffect(() => {
    if (typeof ticketQty !== "number" || ticketQty <= 0) return;
    setAttendeeDetails((prev) => {
      const copy = [...prev];
      const targetQty = ticketQty;
      if (targetQty > copy.length) {
        while (copy.length < targetQty) {
          copy.push({ name: "", email: "" });
        }
      } else if (targetQty < copy.length) {
        copy.splice(targetQty);
      }
      return copy;
    });
  }, [ticketQty]);

  // Set default tier when event is selected
  useEffect(() => {
    if (selectedEvent) {
      if (selectedEvent.tiers && selectedEvent.tiers.length > 0) {
        setSelectedTierName(selectedEvent.tiers[0].name);
      } else {
        setSelectedTierName("General Entry");
      }
      setSelectedSessionIndex(0);
      setTicketQty(1);
      setAttendeeDetails([{ name: "", email: "" }]);
    }
  }, [selectedEvent]);

  const handleQtyBlur = () => {
    let bound = Math.max(1, Math.min(10, Number(ticketQty)));
    if (isNaN(bound)) bound = 1;
    setTicketQty(bound);
  };

  const getTierPrice = () => {
    if (!selectedEvent) return 0;
    if (selectedEvent.tiers && selectedEvent.tiers.length > 0) {
      const match = selectedEvent.tiers.find(t => t.name === selectedTierName);
      return match ? match.price : selectedEvent.price;
    }
    return selectedEvent.price;
  };

  const ticketPrice = getTierPrice();
  const totalPrice = ticketPrice * (typeof ticketQty === "number" ? ticketQty : 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const qty = typeof ticketQty === "number" ? ticketQty : 1;
    const mainAttendee = attendeeDetails[0];

    if (!mainAttendee || !mainAttendee.name.trim() || !mainAttendee.email.trim()) {
      alert("Please fill in the name and email address for the main buyer.");
      return;
    }

    if (qty > 1 && assignMode === "others") {
      const invalid = attendeeDetails.slice(0, qty).some(att => !att.name.trim() || !att.email.trim());
      if (invalid) {
        alert("Please fill in the name and email address for all ticket attendees.");
        return;
      }
    }

    const executeTicketsRegistration = (payRef?: string) => {
      const playersList = storage.getPlayers();
      const ticketsList = storage.getTickets();
      const onboardedNames: string[] = [];

      let sessionDate = selectedEvent.date;
      let sessionTime = selectedEvent.time;
      if (selectedEvent.sessions && selectedEvent.sessions[selectedSessionIndex]) {
        sessionDate = selectedEvent.sessions[selectedSessionIndex].date;
        sessionTime = selectedEvent.sessions[selectedSessionIndex].time;
      }

      // Determine the list of attendees to register
      const listToRegister = (qty > 1 && assignMode === "me")
        ? new Array(qty).fill(mainAttendee)
        : attendeeDetails.slice(0, qty);

      listToRegister.forEach((attendee) => {
        let matchedPlayer = playersList.find(p => p.email.toLowerCase() === attendee.email.toLowerCase());
        
        if (matchedPlayer) {
          matchedPlayer.points += 2;
          onboardedNames.push(`${matchedPlayer.name} (Matched: +2 Pts)`);
        } else {
          const generatedUsername = attendee.name.toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(10 + Math.random() * 90);
          const newPlayer: Player = {
            id: "p_" + Math.random().toString(36).substr(2, 9),
            name: attendee.name,
            username: generatedUsername,
            email: attendee.email,
            password: "password123",
            teamId: null,
            points: 2,
            role: "player",
            walletId: `GSH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            cashWalletBalance: 0,
            voucherWalletBalance: 0,
            transactions: []
          };
          playersList.push(newPlayer);
          matchedPlayer = newPlayer;
          onboardedNames.push(`${newPlayer.name} (New Player: +2 Pts)`);
        }

        const newTicket: Ticket = {
          id: "tk_" + Math.random().toString(36).substr(2, 9),
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          playerId: matchedPlayer ? matchedPlayer.id : null,
          buyerName: attendee.name,
          buyerEmail: attendee.email,
          quantity: 1,
          totalPaid: ticketPrice,
          status: "purchased",
          tierName: selectedTierName,
          sessionDate: sessionDate,
          sessionTime: sessionTime,
          paymentReference: payRef
        };
        ticketsList.push(newTicket);

        const emailBodyHtml = `<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 30px; text-align: center; border-bottom: 4px solid #6366f1;">
            <h1 style="color: #ffffff; margin: 0; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px;">GamesHut Pass</h1>
            <p style="color: #94a3b8; margin: 5px 0 0; font-size: 0.9rem;">Your entry ticket is confirmed</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin: 0 0 8px; font-size: 1.4rem; font-weight: 800;">${selectedEvent.title}</h2>
            <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.08); color: #6366f1; font-weight: 700; font-size: 0.8rem; padding: 6px 14px; border-radius: 20px; margin-bottom: 25px;">
              ${selectedTierName}
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; margin-bottom: 25px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Attendee Name:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right;">${attendee.name}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Event Date:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right;">${sessionDate}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Session Time:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right;">${sessionTime}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Venue Location:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right; max-width: 250px; line-height: 1.4;">${selectedEvent.location}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Amount Paid:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right;">₦${ticketPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="font-size: 0.9rem; color: #64748b;">Ticket Code:</td>
                  <td style="font-size: 0.9rem; color: #6366f1; font-weight: 800; font-family: monospace; text-align: right;">${newTicket.id}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
              <p style="margin: 0 0 6px; font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Check-in Reference</p>
              <div style="font-size: 1.1rem; color: #0f172a; font-weight: 800; letter-spacing: 0.5px;">${payRef || 'FREE_PASS'}</div>
            </div>
            
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.6; margin: 0; text-align: center;">
              Please present this email or your Ticket Code at the check-in desk upon arrival. If you have any questions, reach out to us at <a href="mailto:phcgameshut@gmail.com" style="color: #6366f1; text-decoration: none;">phcgameshut@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.75rem; color: #64748b;">
            © 2026 GamesHut Arena. All Rights Reserved.
          </div>
        </div>`;

        storage.addEmailLog(
          attendee.email,
          attendee.name,
          `Your GamesHut Ticket Pass: ${selectedEvent.title}`,
          emailBodyHtml,
          "tickets@gameshut.ng"
        );
      });

      storage.setPlayers(playersList);
      storage.setTickets(ticketsList);

      setSuccessInfo({
        names: onboardedNames,
        count: qty,
        total: totalPrice
      });

      deselectEvent();
      setShowCheckoutSuccess(true);
    };

    if (totalPrice > 0) {
      loadPaystack().then(paystackLoaded => {
        if (!paystackLoaded) {
          alert("Failed to load Paystack payment gateway. Please check your internet connection.");
          return;
        }

        const handler = (window as any).PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_live_2a9701ed926457f947c7e08497c3a96a6a525b02",
          email: mainAttendee.email,
          amount: totalPrice * 100, // in kobo
          currency: "NGN",
          ref: "gsh_ticket_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now(),
          callback: (response: any) => {
            executeTicketsRegistration(response.reference);
          },
          onClose: () => {
            alert("Payment cancelled.");
          }
        });
        handler.openIframe();
      }).catch(err => {
        console.error("Paystack load error:", err);
      });
    } else {
      executeTicketsRegistration("free_ticket");
    }
  };

  const handleSearchWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletEmail) return;

    const ticketsList = storage.getTickets();
    const matched = ticketsList.filter(t => t.buyerEmail.toLowerCase() === walletEmail.toLowerCase());
    setSearchedTickets(matched);
    setHasSearched(true);
  };

  // Date parsing logic to separate upcoming and past events
  const referenceDate = new Date("2026-07-06");

  const getEventDateObj = (dateStr: string) => {
    return new Date(dateStr);
  };

  const upcomingEvents = events.filter(e => getEventDateObj(e.date) >= referenceDate);
  const pastEvents = events.filter(e => getEventDateObj(e.date) < referenceDate);
  const activeEventsList = eventTab === "upcoming" ? upcomingEvents : pastEvents;

  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Loading Events...</div>
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', fontFamily: "var(--font-family)" }}>
        
        {/* Back Link */}
        <button 
          onClick={deselectEvent}
          className="btn-secondary animate-hover-pop"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "none", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, padding: "0 0 25px 0", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Events Calendar
        </button>

        {/* Dynamic Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }} className="animate-fade-in">
          
          {/* Left Column: Event details info */}
          <div className="corp-card" style={{ padding: '40px', border: '1px solid var(--card-border)' }}>
            {selectedEvent.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={selectedEvent.posterUrl} 
                alt={selectedEvent.title} 
                style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '16px', marginBottom: '30px' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '240px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
                <span style={{ fontSize: '3rem', color: 'white', fontWeight: 800 }}>GSH</span>
              </div>
            )}

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', lineHeight: 1.2 }}>{selectedEvent.title}</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px 0', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)', marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span style={{ fontWeight: 600 }}>{selectedEvent.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontWeight: 600 }}>{selectedEvent.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span style={{ fontWeight: 600 }}>{selectedEvent.location}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
              {selectedEvent.description}
            </p>
          </div>

          {/* Right Column: Ticket Checkout / Booking Form */}
          <div className="corp-card" style={{ padding: '40px', border: '1px solid var(--card-border)', background: '#ffffff', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Checkout Passes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '30px' }}>
              Fill in your details below to register and acquire pass entries.
            </p>

            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Entry Tier Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Entry Tier</label>
                <select
                  value={selectedTierName}
                  onChange={(e) => setSelectedTierName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'white', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {selectedEvent.tiers && selectedEvent.tiers.length > 0 ? (
                    selectedEvent.tiers.map((tier) => (
                      <option key={tier.name} value={tier.name}>{tier.name} - ₦{tier.price.toLocaleString()}</option>
                    ))
                  ) : (
                    <option value="General Entry">General Entry - ₦{selectedEvent.price.toLocaleString()}</option>
                  )}
                </select>
              </div>

              {/* Pass Quantity Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Pass Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  required
                  value={ticketQty}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setTicketQty("");
                    } else {
                      const num = parseInt(val);
                      setTicketQty(isNaN(num) ? 1 : num);
                    }
                  }}
                  onBlur={() => {
                    if (ticketQty === "" || ticketQty < 1) {
                      setTicketQty(1);
                    } else if (ticketQty > 10) {
                      setTicketQty(10);
                    }
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)', fontSize: '0.95rem', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Sessions Selector */}
              {selectedEvent.sessions && selectedEvent.sessions.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}>Select Session Date & Time</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedEvent.sessions.map((sess, idx) => (
                      <label 
                        key={idx} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px',
                          border: `1.5px solid ${selectedSessionIndex === idx ? 'var(--accent-primary)' : 'var(--card-border)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedSessionIndex === idx ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name="event-session-select"
                          checked={selectedSessionIndex === idx}
                          onChange={() => setSelectedSessionIndex(idx)}
                        />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{sess.date} • {sess.time}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Ticket Assignment Options */}
              {typeof ticketQty === "number" && ticketQty > 1 && (
                <div style={{ margin: '15px 0', background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    How would you like to assign these {ticketQty} passes?
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setAssignMode("me")} 
                      style={{ 
                        flex: 1, 
                        padding: '10px', 
                        fontSize: '0.85rem', 
                        borderRadius: '8px', 
                        fontWeight: 600, 
                        border: '1.5px solid', 
                        borderColor: assignMode === "me" ? 'var(--accent-primary)' : 'var(--card-border)', 
                        background: assignMode === "me" ? 'rgba(99, 102, 241, 0.05)' : 'white', 
                        color: 'var(--text-primary)', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      Assign all passes to me
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAssignMode("others")} 
                      style={{ 
                        flex: 1, 
                        padding: '10px', 
                        fontSize: '0.85rem', 
                        borderRadius: '8px', 
                        fontWeight: 600,
                        border: '1.5px solid',
                        borderColor: assignMode === "others" ? 'var(--accent-primary)' : 'var(--card-border)', 
                        background: assignMode === "others" ? 'rgba(99, 102, 241, 0.05)' : 'white', 
                        color: 'var(--text-primary)', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      Assign to specific guests
                    </button>
                  </div>
                </div>
              )}

              {/* Attendee Details List (Dynamic based on quantity) */}
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '15px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {assignMode === "me" || typeof ticketQty !== "number" || ticketQty <= 1 ? "Buyer Details:" : `Attendee Details (${ticketQty}):`}
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                  {attendeeDetails.slice(0, (assignMode === "me" || typeof ticketQty !== "number" || ticketQty <= 1) ? 1 : ticketQty).map((att, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <input 
                          type="text" 
                          required 
                          placeholder={idx === 0 ? "Your Full Name" : `Guest #${idx + 1} Name`}
                          value={att.name || ""}
                          onChange={(e) => {
                            const copy = [...attendeeDetails];
                            copy[idx].name = e.target.value;
                            setAttendeeDetails(copy);
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '0.85rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input 
                          type="email" 
                          required 
                          placeholder={idx === 0 ? "Your Email Address" : `Guest #${idx + 1} Email`}
                          value={att.email || ""}
                          onChange={(e) => {
                            const copy = [...attendeeDetails];
                            copy[idx].email = e.target.value;
                            setAttendeeDetails(copy);
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '0.85rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {assignMode === "me" && typeof ticketQty === "number" && ticketQty > 1 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                    * All {ticketQty} passes will be registered under your name. You can share them with your guests later.
                  </p>
                )}
              </div>

              {/* Invoice Summary Banner */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.04)',
                border: '1.5px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '10px',
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '15px'
              }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total (VAT incl.)</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.4rem' }}>₦{((selectedEvent.tiers?.find(t => t.name === selectedTierName)?.price || selectedEvent.price) * (typeof ticketQty === "number" ? ticketQty : 0)).toLocaleString()}</strong>
              </div>

              {/* Submit Checkout Button */}
              <button 
                type="submit" 
                className="btn-primary animate-hover-pop" 
                style={{ width: '100%', padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: 800, marginTop: '10px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
              >
                Register & Checkout
              </button>

            </form>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', fontFamily: "var(--font-family)" }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
          Events
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', marginBottom: '30px' }}>
          Join our strategy events, offline tournaments, and boardroom battles.
        </p>

        {/* Tab switcher: Upcoming, Past, and Passes */}
        <div style={{ display: 'inline-flex', gap: '10px', background: 'var(--bg-primary)', padding: '6px', borderRadius: '12px' }}>
          <button 
            className={eventTab === "upcoming" ? "btn-primary" : "btn-secondary"} 
            style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
            onClick={() => {
              setEventTab("upcoming");
              setShowCheckoutSuccess(false);
            }}
          >
            Upcoming Events
          </button>
          <button 
            className={eventTab === "past" ? "btn-primary" : "btn-secondary"} 
            style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
            onClick={() => {
              setEventTab("past");
              setShowCheckoutSuccess(false);
            }}
          >
            Past Events
          </button>
          <button 
            className={eventTab === "passes" ? "btn-primary" : "btn-secondary"} 
            style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}
            onClick={() => {
              setEventTab("passes");
              setShowCheckoutSuccess(false);
            }}
          >
            My Event Passes
          </button>
        </div>
      </div>

      {/* VIEW 0: SUCCESS CHECKOUT BANNER */}
      {showCheckoutSuccess && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }} className="animate-fade-in">
          <div className="corp-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', border: '2px solid var(--accent-primary)', padding: '40px' }}>
            <div style={{ marginBottom: '20px', color: '#16a34a' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
              Checkout Successful!
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '25px' }}>
              Your order for <strong>{successInfo.count} Ticket Pass(es)</strong> has been processed successfully. 
              Total Paid: <strong>₦{successInfo.total.toLocaleString()}</strong>.
            </p>

            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', textAlign: 'left', marginBottom: '30px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                Attendee Leaderboard Status:
              </h4>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {successInfo.names.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
            </div>

            <button className="btn-primary" onClick={() => setShowCheckoutSuccess(false)}>
              Back to Events
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: EVENTS LIST */}
      {(eventTab === "upcoming" || eventTab === "past") && !showCheckoutSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }} className="animate-fade-in">
          {activeEventsList.map((event) => (
            <div 
              key={event.id} 
              className="corp-card" 
              style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', padding: '40px', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => {
                if (event.isThirdParty && event.thirdPartyUrl) {
                  window.open(event.thirdPartyUrl, '_blank');
                } else if (eventTab === "upcoming") {
                  selectEvent(event);
                }
              }}
            >
              
              {/* Event Poster Column */}
              <div style={{ flex: '1 1 300px', maxWidth: '350px' }}>
                {event.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={event.posterUrl} 
                    alt={event.title} 
                    style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '12px' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '220px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '2.5rem', color: 'white', fontWeight: 800 }}>GSH</span>
                  </div>
                )}
              </div>
              
              {/* Event Details Column */}
              <div style={{ flex: '2 1 400px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {event.date} • {event.time}
                </span>
                
                <h2 style={{ fontSize: '1.7rem', color: 'var(--text-primary)', marginTop: '8px', marginBottom: '10px', fontWeight: 800 }}>
                  {event.title}
                </h2>
                
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{event.location}</span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', fontSize: '0.95rem' }}>
                  {event.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: "1px solid var(--card-border)", paddingTop: "15px" }}>
                  
                  {eventTab === "upcoming" ? (
                    event.isThirdParty && event.thirdPartyUrl ? (
                      <a 
                        href={event.thirdPartyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary animate-hover-pop" 
                        style={{ padding: '10px 25px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', gap: '8px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Get Tickets
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '10px 25px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectEvent(event);
                        }}
                      >
                        Buy Tickets
                      </button>
                    )
                  ) : (
                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                      Event Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {activeEventsList.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px 0' }}>
              No {eventTab === "upcoming" ? "upcoming" : "past"} events scheduled. Check back soon!
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: RETRIEVE PASSES (TICKET WALLET) */}
      {eventTab === "passes" && !showCheckoutSuccess && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }} className="animate-fade-in">
          <div className="corp-card" style={{ marginBottom: '40px', padding: '30px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>Retrieve Pass Wallet</h3>
            <form onSubmit={handleSearchWallet} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="email" 
                required
                placeholder="Enter attendee email address" 
                value={walletEmail}
                onChange={(e) => setWalletEmail(e.target.value)}
                style={{ flex: '1 1 250px', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '12px 25px', flex: '1 0 auto' }}>Load Wallet</button>
            </form>
          </div>

          {hasSearched && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
                Your Entry Vouchers ({searchedTickets.length})
              </h3>
              
              {searchedTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="corp-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid var(--card-border)'
                  }}
                >
                  <div style={{ padding: '25px', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>GamesHut Entry Pass</span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{ticket.eventTitle}</h4>
                    </div>
                    {ticket.status === "checked_in" ? (
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>✓ Checked In</span>
                    ) : (
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>Active Pass</span>
                    )}
                  </div>

                  <div style={{ borderTop: '2px dashed var(--card-border)', margin: '0 10px' }} />

                  <div style={{ padding: '25px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 220px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>ATTENDEE NAME</span>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{ticket.buyerName}</strong>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>EMAIL ADDRESS</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{ticket.buyerEmail}</span>
                      </div>
                      {ticket.tierName && (
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>TICKET TIER</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{ticket.tierName}</span>
                        </div>
                      )}
                      {ticket.sessionDate && (
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>DATE & TIME</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{ticket.sessionDate} • {ticket.sessionTime}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '0 0 auto' }}>
                      <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="3" height="3" />
                        <rect x="18" y="18" width="3" height="3" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}

              {searchedTickets.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                  No active passes found for email: <strong>{walletEmail}</strong>.
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
