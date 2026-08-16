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

      await writeDb(db);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
