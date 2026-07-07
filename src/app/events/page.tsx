"use client";
import { useState, useEffect } from "react";
import { storage, GameEvent, Player, Ticket } from "@/lib/storage";

export default function Events() {
  const [eventTab, setEventTab] = useState<"upcoming" | "past" | "passes">("upcoming");
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Booking Modal States
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [ticketQty, setTicketQty] = useState(1);
  
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
    setAttendeeDetails((prev) => {
      const copy = [...prev];
      if (ticketQty > copy.length) {
        while (copy.length < ticketQty) {
          copy.push({ name: "", email: "" });
        }
      } else if (ticketQty < copy.length) {
        copy.splice(ticketQty);
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
    let bound = Math.max(1, Math.min(10, ticketQty));
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
  const totalPrice = ticketPrice * ticketQty;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const invalid = attendeeDetails.some(att => !att.name.trim() || !att.email.trim());
    if (invalid) {
      alert("Please fill in the name and email address for all ticket attendees.");
      return;
    }

    const playersList = storage.getPlayers();
    const ticketsList = storage.getTickets();
    const onboardedNames: string[] = [];

    let sessionDate = selectedEvent.date;
    let sessionTime = selectedEvent.time;
    if (selectedEvent.sessions && selectedEvent.sessions[selectedSessionIndex]) {
      sessionDate = selectedEvent.sessions[selectedSessionIndex].date;
      sessionTime = selectedEvent.sessions[selectedSessionIndex].time;
    }

    attendeeDetails.forEach((attendee) => {
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
        sessionTime: sessionTime
      };
      ticketsList.push(newTicket);
    });

    storage.setPlayers(playersList);
    storage.setTickets(ticketsList);

    setSuccessInfo({
      names: onboardedNames,
      count: ticketQty,
      total: totalPrice
    });

    setSelectedEvent(null);
    setShowCheckoutSuccess(true);
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
            <div key={event.id} className="corp-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', padding: '40px', alignItems: 'center' }}>
              
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
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderTop: "1px solid var(--card-border)", paddingTop: "15px" }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₦{event.price.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ ticket</span>
                  </span>
                  
                  {eventTab === "upcoming" ? (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '10px 25px' }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      Buy Tickets
                    </button>
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

      {/* BOOKING MODAL OVERLAY */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '20px'
        }}
        onClick={() => setSelectedEvent(null)}
        >
          <div className="corp-card animate-fade-in" style={{ maxWidth: '600px', width: '100%', background: '#ffffff', position: 'relative', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedEvent(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '5px' }}>Checkout Passes</h3>
            <span style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedEvent.title}</span>

            <form onSubmit={handleCheckoutSubmit} style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Select Ticket Tier</label>
                <select 
                  value={selectedTierName} 
                  onChange={(e) => setSelectedTierName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'white' }}
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

              {selectedEvent.sessions && selectedEvent.sessions.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Select Session Date & Time</label>
                  <select 
                    value={selectedSessionIndex} 
                    onChange={(e) => setSelectedSessionIndex(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'white' }}
                  >
                    {selectedEvent.sessions.map((sess, idx) => (
                      <option key={idx} value={idx}>{sess.date} ({sess.time})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '5px', fontWeight: 600 }}>Number of Tickets</label>
                <input 
                  type="number" 
                  min={1} 
                  max={10} 
                  required
                  value={ticketQty}
                  onChange={(e) => setTicketQty(parseInt(e.target.value) || 0)}
                  onBlur={handleQtyBlur}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)' }}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Guest Registration List ({ticketQty}):
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                  {attendeeDetails.map((att, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 120px' }}>
                        <input 
                          type="text" 
                          required 
                          placeholder={`Guest #${idx + 1} Name`}
                          value={att.name}
                          onChange={(e) => {
                            const copy = [...attendeeDetails];
                            copy[idx].name = e.target.value;
                            setAttendeeDetails(copy);
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '0.85rem', background: 'var(--bg-primary)' }}
                        />
                      </div>
                      <div style={{ flex: '1.5 1 180px' }}>
                        <input 
                          type="email" 
                          required 
                          placeholder={`Guest #${idx + 1} Email`}
                          value={att.email}
                          onChange={(e) => {
                            const copy = [...attendeeDetails];
                            copy[idx].email = e.target.value;
                            setAttendeeDetails(copy);
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '0.85rem', background: 'var(--bg-primary)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--card-border)', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tier Price</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₦{ticketPrice.toLocaleString()} each</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Quantity</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ticketQty}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', borderTop: '1px dashed var(--card-border)', paddingTop: '10px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Total to Pay</strong>
                  <strong style={{ color: 'var(--accent-primary)' }}>₦{totalPrice.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => setSelectedEvent(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 2, padding: '12px' }}
                >
                  Complete Checkout
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
