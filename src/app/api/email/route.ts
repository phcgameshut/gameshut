import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "Brevo API key not configured. Mocking email delivery locally." });
  }

  try {
    const { to, name, subject, html } = await request.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const fromEmail = process.env.BREVO_FROM_EMAIL || "info@gameshut.ng";

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "GamesHut",
          email: fromEmail
        },
        to: [
          {
            email: to,
            name: name || to
          }
        ],
        subject: subject,
        htmlContent: html
      })
    });

    const json = await response.json();
    if (response.ok) {
      return NextResponse.json({ success: true, id: json.messageId });
    } else {
      return NextResponse.json({ success: false, error: json.message || "Failed to dispatch email via Brevo" }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
