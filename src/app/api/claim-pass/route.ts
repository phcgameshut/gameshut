import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = (await readDb()) || {};
    if (!db.tickets) db.tickets = [];
    if (!db.notifications) db.notifications = [];
    if (!db.emailLogs) db.emailLogs = [];

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    // Check if email already claimed a free ticket for this event
    const existing = db.tickets.find((t: any) => 
      t.buyerEmail?.toLowerCase() === cleanEmail && 
      (t.eventId === "ev_tetris_party" || t.eventTitle?.includes("Tetris"))
    );

    if (existing) {
      return NextResponse.json({ 
        ticket: {
          id: existing.id,
          buyerName: existing.buyerName,
          buyerEmail: existing.buyerEmail,
          eventTitle: existing.eventTitle,
          date: existing.sessionDate || "September 26, 2026",
          time: existing.sessionTime || "4:00 PM",
          location: "Praia Lagos, Victoria Island"
        },
        message: "You have already claimed your ticket pass!"
      });
    }

    // Find event
    const event = (db.events || []).find((e: any) => e.title?.includes("Tetris")) || {
      id: "ev_tetris_party",
      title: "GamesHut Tetris Party",
      date: "September 26, 2026",
      time: "4:00 PM",
      location: "Praia Lagos, Victoria Island"
    };

    // Generate ticket code GHxxx
    const existingIds = new Set(db.tickets.map((t: any) => t.id));
    let ticketCode = "";
    do {
      const num = Math.floor(100 + Math.random() * 900);
      ticketCode = `GH${num}`;
    } while (existingIds.has(ticketCode));

    const newTicket = {
      id: ticketCode,
      eventId: event.id,
      eventTitle: event.title,
      playerId: null,
      buyerName: cleanName,
      buyerEmail: cleanEmail,
      phone: cleanPhone,
      quantity: 1,
      totalPaid: 0,
      status: "purchased",
      tierName: "Student Free Entry",
      sessionDate: event.date,
      sessionTime: event.time,
      paymentReference: `FREE_STUDENT_${ticketCode}`
    };

    db.tickets.push(newTicket);

    // Add admin notification
    db.notifications.push({
      id: "n_" + Math.random().toString(36).substr(2, 9),
      userId: "admin",
      title: "Free Student Ticket Claimed",
      message: `${cleanName} (${cleanEmail} | ${cleanPhone}) claimed a free student pass (${ticketCode}) for ${event.title}.`,
      type: "ticket",
      date: new Date().toISOString(),
      read: false
    });

    // Add email log (invoice/pass dispatch)
    db.emailLogs.push({
      id: "em_" + Math.random().toString(36).substr(2, 9),
      recipientEmail: cleanEmail,
      recipientName: cleanName,
      subject: `Your Free Ticket Pass: GamesHut Tetris Party (${ticketCode})`,
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #3B5CEB; padding: 25px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 1.6rem; font-weight: 800;">GAMESHUT PASS</h2>
            <p style="margin: 5px 0 0; font-size: 0.9rem; opacity: 0.9;">Student VIP Entry Pass Confirmed</p>
          </div>
          <div style="padding: 25px;">
            <p>Hello <strong>${cleanName}</strong>,</p>
            <p>Your free student ticket pass for the <strong>GamesHut Tetris Party</strong> has been confirmed!</p>
            
            <div style="background: #f8fafc; border: 2px dashed #3B5CEB; border-radius: 10px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Ticket Pass Code</span>
              <span style="font-family: monospace; font-size: 1.8rem; font-weight: 900; color: #3B5CEB;">${ticketCode}</span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 20px;">
              <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 8px 0; color: #64748b;">Event:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${event.title}</td></tr>
              <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 8px 0; color: #64748b;">Tier:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #3B5CEB;">Student Free Entry</td></tr>
              <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 8px 0; color: #64748b;">Date & Time:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${event.date} @ ${event.time}</td></tr>
              <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 8px 0; color: #64748b;">Venue:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">Praia Lagos, Victoria Island</td></tr>
            </table>

            <p style="font-size: 0.85rem; color: #64748b;">* Please present this email ticket pass along with a valid Student ID at entry.</p>
          </div>
        </div>
      `,
      sentAt: new Date().toISOString()
    });

    await writeDb(db);

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketCode,
        buyerName: cleanName,
        buyerEmail: cleanEmail,
        eventTitle: event.title,
        date: event.date,
        time: event.time,
        location: "Praia Lagos, Victoria Island"
      }
    });

  } catch (error: any) {
    console.error("Claim pass error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
