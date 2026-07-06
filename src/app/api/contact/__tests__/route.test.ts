import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../route";

const originalEnv = process.env;

function req(body: unknown) {
  return new Request("https://example.com/api/contact", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

async function json(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "Portfolio <hello@example.com>";
    process.env.CONTACT_TO_EMAIL = "travis@example.com";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("sends a valid contact message through Resend", async () => {
    const res = await POST(
      req({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello from the contact form.",
      })
    );

    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer re_test",
          "User-Agent": "portfolio-contact-form/1.0",
        }),
      })
    );

    const body = JSON.parse(String((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body));
    expect(body).toMatchObject({
      from: "Portfolio <hello@example.com>",
      to: ["travis@example.com"],
      reply_to: "ada@example.com",
      subject: "Portfolio contact from Ada Lovelace",
    });
    expect(body.text).toContain("Hello from the contact form.");
  });

  it("returns validation errors without calling Resend", async () => {
    const res = await POST(req({ name: "", email: "bad", message: "short" }));

    expect(res.status).toBe(400);
    expect(await json(res)).toMatchObject({
      error: "Invalid contact form",
      errors: {
        name: "Name is required",
        email: "Please enter a valid email",
        message: "Message must be at least 10 characters",
      },
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports missing email configuration", async () => {
    delete process.env.RESEND_API_KEY;

    const res = await POST(
      req({
        name: "Ada",
        email: "ada@example.com",
        message: "Hello from the contact form.",
      })
    );

    expect(res.status).toBe(503);
    expect(await json(res)).toEqual({ error: "Email is not configured" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports provider failures", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("bad", { status: 403 }));

    const res = await POST(
      req({
        name: "Ada",
        email: "ada@example.com",
        message: "Hello from the contact form.",
      })
    );

    expect(res.status).toBe(502);
    expect(await json(res)).toEqual({ error: "Email failed to send" });
  });
});
