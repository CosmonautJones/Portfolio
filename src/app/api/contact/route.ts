import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { normalizeContact, validateContact, type ContactFormValues } from "@/lib/contact";

export const runtime = "nodejs";

const RESEND_URL = "https://api.resend.com/emails";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function configuredEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || SITE_CONFIG.email;

  if (!apiKey || !from || !to) return null;
  return { apiKey, from, to };
}

async function readPayload(request: Request): Promise<ContactFormValues | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return null;
    return {
      name: String((body as Record<string, unknown>).name ?? ""),
      email: String((body as Record<string, unknown>).email ?? ""),
      message: String((body as Record<string, unknown>).message ?? ""),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const payload = await readPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const errors = validateContact(payload);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Invalid contact form", errors }, { status: 400 });
  }

  const emailConfig = configuredEmail();
  if (!emailConfig) {
    return NextResponse.json({ error: "Email is not configured" }, { status: 503 });
  }

  const values = normalizeContact(payload);
  const safeName = escapeHtml(values.name);
  const safeEmail = escapeHtml(values.email);
  const safeMessage = escapeHtml(values.message).replace(/\n/g, "<br />");
  const subject = `Portfolio contact from ${values.name}`;

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${emailConfig.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-contact-form/1.0",
    },
    body: JSON.stringify({
      from: emailConfig.from,
      to: [emailConfig.to],
      reply_to: values.email,
      subject,
      text: `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`,
      html: `<p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p>${safeMessage}</p>`,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error("Resend email failed", {
      status: res.status,
      body: errorBody,
    });
    return NextResponse.json({ error: "Email failed to send" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
