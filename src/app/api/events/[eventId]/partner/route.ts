import { NextResponse } from "next/server";
import { readDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "Missing event ID" }, { status: 400 });
    }

    const db = (await readDb()) || {};
    const events = db.events || [];
    const tickets = db.tickets || [];

    // Find target event (by exact ID or by title match if legacy)
    const event = events.find((e: any) => 
      e.id === eventId || 
      e.id?.toLowerCase() === eventId.toLowerCase() ||
      (e.title && e.title.toLowerCase().replace(/[^a-z0-9]/g, "_").includes(eventId.toLowerCase()))
    );

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Filter tickets belonging strictly to this event
    const eventTickets = tickets.filter((t: any) => {
      if (t.eventId && t.eventId === event.id) return true;
      if (t.eventTitle && event.title && t.eventTitle.toLowerCase() === event.title.toLowerCase()) return true;
      if (eventId === "ev_tetris_party" && t.eventTitle?.toLowerCase().includes("tetris")) return true;
      return false;
    });

    // Compute key metrics
    const totalTicketsSold = eventTickets.reduce((sum: number, t: any) => sum + (t.quantity || 1), 0);
    const totalRevenue = eventTickets.reduce((sum: number, t: any) => sum + (t.totalPaid || 0), 0);
    const checkedInCount = eventTickets.filter((t: any) => t.status === "checked_in").length;

    // Breakdown by Tier
    const tierBreakdown: Record<string, { count: number; revenue: number; capacity?: number; soldOut?: boolean }> = {};
    
    // Seed tiers from event definition
    if (event.tiers && Array.isArray(event.tiers)) {
      event.tiers.forEach((tier: any) => {
        tierBreakdown[tier.name] = {
          count: 0,
          revenue: 0,
          capacity: tier.capacity,
          soldOut: !!tier.soldOut
        };
      });
    }

    // Populate actual sales per tier
    eventTickets.forEach((t: any) => {
      const tierName = t.tierName || "Standard Entry";
      if (!tierBreakdown[tierName]) {
        tierBreakdown[tierName] = { count: 0, revenue: 0 };
      }
      tierBreakdown[tierName].count += (t.quantity || 1);
      tierBreakdown[tierName].revenue += (t.totalPaid || 0);
    });

    // Breakdown by Session
    const sessionBreakdown: Record<string, number> = {};
    eventTickets.forEach((t: any) => {
      const sess = t.sessionDate ? `${t.sessionDate} (${t.sessionTime || "Default"})` : "General Session";
      sessionBreakdown[sess] = (sessionBreakdown[sess] || 0) + (t.quantity || 1);
    });

    // Format Attendee Roster (exposing relevant non-sensitive partner details)
    const attendees = eventTickets.map((t: any) => ({
      id: t.id,
      buyerName: t.buyerName || "Guest",
      buyerEmail: t.buyerEmail || "N/A",
      tierName: t.tierName || "Standard Entry",
      quantity: t.quantity || 1,
      totalPaid: t.totalPaid || 0,
      sessionDate: t.sessionDate || event.date || "N/A",
      sessionTime: t.sessionTime || event.time || "N/A",
      status: t.status || "purchased",
      paymentReference: t.paymentReference || t.id,
      discountCode: t.discountCode || null
    }));

    return NextResponse.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          posterUrl: event.posterUrl,
          description: event.description,
          tiers: event.tiers || []
        },
        metrics: {
          totalTicketsSold,
          totalRevenue,
          checkedInCount,
          totalOrders: eventTickets.length
        },
        tierBreakdown,
        sessionBreakdown,
        attendees
      }
    });

  } catch (error: any) {
    console.error("Partner API error:", error);
    return NextResponse.json({ success: false, error: "Failed to load partner event metrics" }, { status: 500 });
  }
}
