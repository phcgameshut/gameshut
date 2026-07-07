import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "Resend API key not configured. Mocking email delivery locally." });
  }

  try {
    const { to, name, subject, html } = await request.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: `GamesHut <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: html
      })
    });

    const json = await response.json();
    if (response.ok) {
      return NextResponse.json({ success: true, id: json.id });
    } else {
      return NextResponse.json({ success: false, error: json.message || "Failed to dispatch email" }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
