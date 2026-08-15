import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountStr) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT");
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountStr);
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const firestore = getFirestore();

async function run() {
  console.log("Reading state from Firestore...");
  const docRef = firestore.doc("gameshut/state");
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    console.error("No state found in Firestore!");
    process.exit(1);
  }
  
  const state = docSnap.data() as any;
  const events = state.events || [];
  const ticketsList = state.tickets || [];
  const emailLogs = state.email_logs || [];
  
  const targetEvent = events.find((e: any) => e.title === "The Things We Do on Tables");
  if (!targetEvent) {
    console.error("Event not found!");
    process.exit(1);
  }
  console.log("Found event:", targetEvent.title);
  
  const generatedTickets: any[] = [];
  
  for (let i = 0; i < 6; i++) {
    let ticketId = "";
    const existingIds = new Set(ticketsList.map((t: any) => t.id));
    do {
      const num = Math.floor(100 + Math.random() * 900); // 100 to 999
      ticketId = `GH${num}`;
    } while (existingIds.has(ticketId));
    
    const newTicket = {
      id: ticketId,
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      playerId: null,
      buyerName: "Uzochi Igwe",
      buyerEmail: "uzochiwunduigwe@gmail.com",
      quantity: 1,
      totalPaid: 5000,
      status: "purchased",
      tierName: "Regular",
      sessionDate: targetEvent.date,
      sessionTime: targetEvent.time,
      paymentReference: "MANUAL-TRANSFER-DOWNTIME"
    };
    
    ticketsList.push(newTicket);
    generatedTickets.push(newTicket);
  }
  
  const origin = "https://gameshut.ng";
  
  generatedTickets.forEach((ticket) => {
    const emailSubject = `Your GamesHut Ticket Pass: ${targetEvent.title}`;
    const emailBodyHtml = `<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 30px; text-align: center; border-bottom: 4px solid #6366f1;">
            <h1 style="color: #ffffff; margin: 0; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px;">GamesHut Pass</h1>
            <p style="color: #94a3b8; margin: 5px 0 0; font-size: 0.9rem;">Your entry ticket is confirmed</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin: 0 0 8px; font-size: 1.4rem; font-weight: 800;">${targetEvent.title}</h2>
            <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.08); color: #6366f1; font-weight: 700; font-size: 0.8rem; padding: 6px 14px; border-radius: 20px; margin-bottom: 25px;">
              ${ticket.tierName}
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; margin-bottom: 25px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Attendee Name:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right;">${ticket.buyerName}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Event Date:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right;">${ticket.sessionDate}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Session Time:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right;">${ticket.sessionTime}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Venue Location:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right; max-width: 250px; line-height: 1.4;">${targetEvent.location}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #64748b;">Amount Paid:</td>
                  <td style="padding-bottom: 12px; font-size: 0.9rem; color: #0f172a; font-weight: 700; text-align: right;">₦${ticket.totalPaid.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="font-size: 0.9rem; color: #64748b;">Ticket Code:</td>
                  <td style="font-size: 0.9rem; color: #6366f1; font-weight: 800; font-family: monospace; text-align: right;">${ticket.id}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
              <p style="margin: 0 0 6px; font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Check-in Reference</p>
              <div style="font-size: 1.1rem; color: #0f172a; font-weight: 800; letter-spacing: 0.5px;">${ticket.paymentReference}</div>
            </div>

            <div style="text-align: center; margin-bottom: 25px;">
              <a href="${origin}/events?pass=${ticket.id}" style="background-color: #6366f1; color: #ffffff; padding: 12px 30px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">
                Download PDF Ticket Pass
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.6; margin: 0; text-align: center;">
              Please present this email or your Ticket Code at the check-in desk upon arrival. If you have any questions, reach out to us at <a href="mailto:phcgameshut@gmail.com" style="color: #6366f1; text-decoration: none;">phcgameshut@gmail.com</a>.
            </p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.75rem; color: #64748b;">
            © 2026 GamesHut Arena. All Rights Reserved.
          </div>
        </div>`;

    const newLog = {
      id: "LOG-" + Math.floor(1000000 + Math.random() * 9000000).toString(),
      recipientEmail: ticket.buyerEmail,
      recipientName: ticket.buyerName,
      subject: emailSubject,
      bodyHtml: emailBodyHtml,
      status: "pending",
      timestamp: new Date().toISOString(),
      senderEmail: "tickets@gameshut.ng"
    };
    emailLogs.push(newLog);
  });
  
  state.tickets = ticketsList;
  state.email_logs = emailLogs;
  
  await docRef.set(state, { merge: true });
  console.log(`Generated ${generatedTickets.length} tickets:`, generatedTickets.map(t => t.id));
  console.log("Successfully updated Firestore!");
  process.exit(0);
}
run();
