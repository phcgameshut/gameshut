"use client";

import { useState, useEffect, use } from "react";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  posterUrl?: string;
  description?: string;
  tiers?: any[];
}

interface Metrics {
  totalTicketsSold: number;
  totalRevenue: number;
  checkedInCount: number;
  totalOrders: number;
}

interface Attendee {
  id: string;
  buyerName: string;
  buyerEmail: string;
  tierName: string;
  quantity: number;
  totalPaid: number;
  sessionDate: string;
  sessionTime: string;
  status: string;
  paymentReference: string;
  discountCode?: string | null;
}

export default function PartnerEventPortalPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventData | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [tierBreakdown, setTierBreakdown] = useState<Record<string, any>>({});
  const [sessionBreakdown, setSessionBreakdown] = useState<Record<string, number>>({});
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/events/${eventId}/partner`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load partner dashboard");
        }

        setEvent(json.data.event);
        setMetrics(json.data.metrics);
        setTierBreakdown(json.data.tierBreakdown || {});
        setSessionBreakdown(json.data.sessionBreakdown || {});
        setAttendees(json.data.attendees || []);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchPartnerData();
    }
  }, [eventId]);

  const handleExportCSV = () => {
    if (!attendees.length || !event) return;

    const headers = ["Ticket ID", "Buyer Name", "Buyer Email", "Tier", "Quantity", "Amount Paid (NGN)", "Session Date", "Session Time", "Status", "Payment Reference", "Discount Code"];
    const rows = filteredAttendees.map(a => [
      a.id,
      `"${a.buyerName.replace(/"/g, '""')}"`,
      a.buyerEmail,
      `"${a.tierName}"`,
      a.quantity,
      a.totalPaid,
      `"${a.sessionDate}"`,
      `"${a.sessionTime}"`,
      a.status,
      a.paymentReference || "",
      a.discountCode || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title.replace(/[^a-z0-9]/gi, '_')}_Attendees_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = 
      a.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.paymentReference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = filterTier === "all" || a.tierName === filterTier;

    return matchesSearch && matchesTier;
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "var(--font-family)" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#3b5ceb", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>Loading Partner Transparency Portal...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !event || !metrics) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "20px", fontFamily: "var(--font-family)" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "40px", borderRadius: "20px", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "2.5rem" }}>⚠️</span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginTop: "12px", marginBottom: "8px" }}>Portal Unavailable</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "20px" }}>
            {error || "The requested event transparency dashboard could not be loaded."}
          </p>
          <a href="/events" style={{ display: "inline-block", background: "#3b5ceb", color: "#ffffff", fontWeight: 700, padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "0.9rem" }}>
            Return to Events
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "30px 20px 60px", fontFamily: "var(--font-family)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* HEADER BAR */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px 30px", marginBottom: "25px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {event.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.posterUrl} alt={event.title} style={{ width: "64px", height: "64px", borderRadius: "14px", objectFit: "cover", border: "1px solid #e2e8f0" }} />
            ) : (
              <div style={{ width: "64px", height: "64px", borderRadius: "14px", background: "linear-gradient(135deg, #3b5ceb, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.5rem" }}>
                GH
              </div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{ background: "rgba(59, 92, 235, 0.1)", color: "#3b5ceb", fontWeight: 800, fontSize: "0.72rem", padding: "3px 10px", borderRadius: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  🤝 Official Partner Transparency Portal
                </span>
              </div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                {event.title}
              </h1>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                📍 {event.location} • 📅 {event.date} ({event.time})
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={handleExportCSV}
              disabled={!filteredAttendees.length}
              style={{
                background: "#3b5ceb",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                padding: "11px 18px",
                borderRadius: "10px",
                cursor: filteredAttendees.length ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: filteredAttendees.length ? 1 : 0.6,
                boxShadow: "0 4px 14px rgba(59, 92, 235, 0.2)"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Attendee CSV
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "25px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Tickets Sold</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginTop: "6px" }}>{metrics.totalTicketsSold.toLocaleString()}</div>
            <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600, marginTop: "4px" }}>Across {metrics.totalOrders} order transaction(s)</div>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Ticket Revenue</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#3b5ceb", marginTop: "6px" }}>₦{metrics.totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "4px" }}>Gross Sales Revenue</div>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Attendees Checked-In</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#10b981", marginTop: "6px" }}>{metrics.checkedInCount}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "4px" }}>Verified Gate Passes</div>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Average Ticket Value</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#8b5cf6", marginTop: "6px" }}>
              ₦{metrics.totalTicketsSold ? Math.round(metrics.totalRevenue / metrics.totalTicketsSold).toLocaleString() : 0}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "4px" }}>Per Issued Pass</div>
          </div>
        </div>

        {/* TIER & SESSION BREAKDOWN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px", marginBottom: "30px" }}>
          
          {/* TIER BREAKDOWN */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🎟️ Sales by Ticket Tier</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>{Object.keys(tierBreakdown).length} Tiers Defined</span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(tierBreakdown).map(([tierName, info]: [string, any]) => (
                <div key={tierName} style={{ background: "#f8fafc", border: "1px solid #f1f5f9", padding: "14px 16px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>{tierName}</span>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#3b5ceb" }}>₦{info.revenue.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    <span>Passes Sold: <strong>{info.count}</strong> {info.capacity ? `/ ${info.capacity}` : ""}</span>
                    {info.soldOut && <span style={{ color: "#ef4444", fontWeight: 700 }}>SOLD OUT</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SESSION BREAKDOWN */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
              📅 Session Attendance Distribution
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(sessionBreakdown).map(([sessName, count]) => (
                <div key={sessName} style={{ background: "#f8fafc", border: "1px solid #f1f5f9", padding: "14px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{sessName}</span>
                  <span style={{ background: "#e0e7ff", color: "#3b5ceb", fontWeight: 800, fontSize: "0.8rem", padding: "4px 10px", borderRadius: "10px" }}>
                    {count} Pass{count === 1 ? "" : "es"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ATTENDEE ROSTER TABLE */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "25px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                📋 Ticket Buyers & Attendee Roster
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                Showing {filteredAttendees.length} of {attendees.length} verified ticket pass records
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: "1 1 300px", justifyContent: "flex-end" }}>
              {/* Filter by Tier */}
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem", outline: "none", background: "#fff" }}
              >
                <option value="all">All Tiers</option>
                {Object.keys(tierBreakdown).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Search Bar */}
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, or ticket code..."
                style={{ padding: "9px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem", outline: "none", minWidth: "220px" }}
              />
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: 700 }}>
                  <th style={{ padding: "12px 14px" }}>Ticket Code</th>
                  <th style={{ padding: "12px 14px" }}>Buyer Name</th>
                  <th style={{ padding: "12px 14px" }}>Email Address</th>
                  <th style={{ padding: "12px 14px" }}>Tier</th>
                  <th style={{ padding: "12px 14px" }}>Paid</th>
                  <th style={{ padding: "12px 14px" }}>Session</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.length > 0 ? (
                  filteredAttendees.map((a, idx) => (
                    <tr key={a.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 800, color: "#3b5ceb" }}>{a.id}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>{a.buyerName}</td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>{a.buyerEmail}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: "rgba(59, 92, 235, 0.08)", color: "#3b5ceb", fontWeight: 700, fontSize: "0.78rem", padding: "3px 8px", borderRadius: "6px" }}>
                          {a.tierName}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                        {a.totalPaid ? `₦${a.totalPaid.toLocaleString()}` : "Free"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                        {a.sessionDate}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ 
                          background: a.status === "checked_in" ? "#dcfce7" : "#e0e7ff", 
                          color: a.status === "checked_in" ? "#15803d" : "#3b5ceb", 
                          fontWeight: 700, 
                          fontSize: "0.75rem", 
                          padding: "3px 8px", 
                          borderRadius: "6px" 
                        }}>
                          {a.status === "checked_in" ? "Checked In" : "Purchased"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)" }}>
                      No ticket sales match your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
