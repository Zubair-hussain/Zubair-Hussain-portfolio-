import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/verify-email/route";
import {
  emailDomain,
  isDisposableEmailDomain,
  normalizeEmail,
  validateEmailSyntax,
} from "../src/lib/email-verification";

function request(email: unknown) {
  return new Request("https://portfolio.example/api/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

function dnsResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/dns-json" },
  });
}

describe("email verification", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("normalizes addresses and rejects malformed or disposable email", () => {
    expect(normalizeEmail("  PERSON@Example.COM ")).toBe("person@example.com");
    expect(emailDomain("person@example.com")).toBe("example.com");
    expect(validateEmailSyntax("person@example.com")).toBe(true);
    expect(validateEmailSyntax("bad..address@example.com")).toBe(false);
    expect(validateEmailSyntax("person@localhost")).toBe(false);
    expect(isDisposableEmailDomain("mailinator.com")).toBe(true);
  });

  it("accepts a normalized address when its domain publishes MX records", async () => {
    const fetchMock = vi.fn(async (_input: string | URL) =>
      dnsResponse({
        Status: 0,
        Answer: [{ type: 15, data: "10 mail.example." }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request(" Person@Example.com "));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      valid: true,
      normalizedEmail: "person@example.com",
      domain: "example.com",
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain("type=MX");
  });

  it("rejects a nonexistent domain without address fallback queries", async () => {
    const fetchMock = vi.fn(async () => dnsResponse({ Status: 3 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request("person@does-not-exist.example"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      valid: false,
      reason: "This email domain does not exist.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("supports the RFC address-record fallback when MX is absent", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(dnsResponse({ Status: 0 }))
      .mockResolvedValueOnce(
        dnsResponse({ Status: 0, Answer: [{ type: 1, data: "192.0.2.1" }] }),
      )
      .mockResolvedValueOnce(dnsResponse({ Status: 0 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request("person@example.com"));
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns a retryable response when DNS verification is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("offline"))),
    );
    const response = await POST(request("person@example.com"));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      valid: false,
      reason: "Email verification is temporarily unavailable.",
    });
  });
});
