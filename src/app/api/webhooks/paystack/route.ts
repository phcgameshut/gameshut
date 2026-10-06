import { NextResponse } from "next/server";
import crypto from "crypto";
import { readDb, writeDb } from "@/lib/serverDb";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json({ error: "Missing secret key" }, { status: 500 });
    }

    // Verify signature
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const db = await readDb();
      if (!db) return NextResponse.json({ error: "Database error" }, { status: 500 });
      
      const { metadata, amount, reference } = event.data;
      
      // Prevent double processing
      if (!db.transactions) db.transactions = [];
      if (db.transactions.find((tx: any) => tx.reference === reference)) {
         return NextResponse.json({ status: "already processed" });
      }

      // Record transaction
      db.transactions.push({
        reference,
        amount: amount / 100, // Paystack amount is in kobo
        metadata,
        date: new Date().toISOString()
      });

      // Handle donation logic here if metadata specifies it
      if (metadata && metadata.type === "donation") {
        if (!db.donations) db.donations = [];
        db.donations.push({
          id: reference,
          name: metadata.name || "Anonymous",
          amount: amount / 100,
          date: new Date().toISOString(),
          type: metadata.isRecurring ? "recurring" : "one-time"
        });
        
        // Add notification for admin
        if (!db.notifications) db.notifications = [];
        db.notifications.push({
          id: "n_" + Math.random().toString(36).substr(2, 9),
          userId: "admin",
          title: "New Donation Received!",
          message: `${metadata.name || "Anonymous"} just donated ₦${amount / 100}.`,
          type: "wallet",
          date: new Date().toISOString(),
          read: false
        });
      }

      // Handle ticket purchase logic if metadata specifies event/ticket details
      if (metadata && (metadata.type === "ticket" || metadata.eventId)) {
        if (!db.tickets) db.tickets = [];
        const existingTicket = db.tickets.find((t: any) => t.paymentReference === reference);
        if (!existingTicket) {
          const qty = metadata.quantity || 1;
          const customerEmail = event.data.customer?.email || metadata.email || "guest@gameshut.ng";
          const customerName = metadata.buyerName || metadata.name || customerEmail.split('@')[0];
          const eventId = metadata.eventId || "ev_tetris_party";
          const eventTitle = metadata.eventTitle || "Gameshut Tetris Party";
          const tierName = metadata.tierName || "Standard Entry";

          for (let i = 0; i < qty; i++) {
            const existingIds = new Set(db.tickets.map((t: any) => t.id));
            let ticketCode = "";
            do {
              const num = Math.floor(100 + Math.random() * 900);
              ticketCode = `GH${num}`;
            } while (existingIds.has(ticketCode));

            const newTicket = {
              id: ticketCode,
              eventId: eventId,
              eventTitle: eventTitle,
              playerId: metadata.playerId || null,
              buyerName: customerName,
              buyerEmail: customerEmail,
              quantity: 1,
              totalPaid: (amount / 100) / qty,
              status: "purchased",
              tierName: tierName,
              sessionDate: metadata.sessionDate || "September 26, 2026",
              sessionTime: metadata.sessionTime || "4:00 PM",
              paymentReference: reference
            };

            db.tickets.push(newTicket);

            // Dispatch Brevo email to buyer
            if (process.env.BREVO_API_KEY) {
              try {
                const emailHtml = `
                  <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
                    <div style="background: #3B5CEB; padding: 25px; text-align: center; color: white;">
                      <h2 style="margin: 0; font-size: 1.6rem; font-weight: 800;">GAMESHUT PASS</h2>
                      <p style="margin: 5px 0 0; font-size: 0.9rem; opacity: 0.9;">Entry Ticket Confirmed</p>
                    </div>
                    <div style="padding: 25px;">
                      <p>Hello <strong>${customerName}</strong>,</p>
                      <p>Your ticket pass for <strong>${eventTitle}</strong> is confirmed!</p>
                      <div style="background: #f8fafc; border: 2px dashed #3B5CEB; border-radius: 10px; padding: 15px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Ticket Code</span>
                        <span style="font-family: monospace; font-size: 1.8rem; font-weight: 900; color: #3B5CEB;">${ticketCode}</span>
                      </div>
                      <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 20px;">
                        <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 8px 0; color: #64748b;">Event:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${eventTitle}</td></tr>
                        <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 8px 0; color: #64748b;">Tier:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #3B5CEB;">${tierName}</td></tr>
                        <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 8px 0; color: #64748b;">Amount Paid:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">₦${((amount / 100) / qty).toLocaleString()}</td></tr>
                        <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 8px 0; color: #64748b;">Payment Ref:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; font-family: monospace;">${reference}</td></tr>
                      </table>
                      <p style="font-size: 0.85rem; color: #64748b;">* Present this email or code upon arrival.</p>
                    </div>
                  </div>
                `;

                fetch("https://api.brevo.com/v3/smtp/email", {
                  method: "POST",
                  headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                  },
                  body: JSON.stringify({
                    sender: { name: "GamesHut", email: process.env.BREVO_FROM_EMAIL || "notifications@gameshut.ng" },
                    to: [{ email: customerEmail, name: customerName }],
                    subject: `Your Ticket Pass: ${eventTitle} (${ticketCode})`,
                    htmlContent: emailHtml
                  })
                }).catch(e => console.error("Webhook buyer email error:", e));

                // Admin notification email
                fetch("https://api.brevo.com/v3/smtp/email", {
                  method: "POST",
                  headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                  },
                  body: JSON.stringify({
                    sender: { name: "GamesHut Alerts", email: process.env.BREVO_FROM_EMAIL || "notifications@gameshut.ng" },
                    to: [{ email: "phcgameshut@gmail.com", name: "GamesHut Admin" }],
                    subject: `🎟️ New Ticket Purchase: ${eventTitle} — ₦${(amount / 100).toLocaleString()}`,
                    htmlContent: `<p><strong>${customerName}</strong> (${customerEmail}) just purchased ${qty} ticket pass(es) for <strong>${eventTitle}</strong> (Ref: ${reference}). Code: ${ticketCode}.</p>`
                  })
                }).catch(e => console.error("Webhook admin email error:", e));

              } catch (err) {
                console.error("Brevo webhook dispatch error:", err);
              }
            }
          }

          if (!db.notifications) db.notifications = [];
          db.notifications.push({
            id: "n_" + Math.random().toString(36).substr(2, 9),
            userId: "admin",
            title: "New Ticket Purchase via Paystack",
            message: `${customerName} (${customerEmail}) purchased ${qty} ticket(s) for ${eventTitle} (Ref: ${reference}).`,
            type: "ticket",
            date: new Date().toISOString(),
            read: false
          });
        }
      }

      await writeDb(db);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
