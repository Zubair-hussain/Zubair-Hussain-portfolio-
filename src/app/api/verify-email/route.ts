import { NextResponse } from "next/server";
import {
  emailDomain,
  isDisposableEmailDomain,
  normalizeEmail,
  validateEmailSyntax,
} from "@/lib/email-verification";

export const dynamic = "force-dynamic";

interface DnsAnswer {
  type?: number;
  data?: string;
}

interface DnsResponse {
  Status?: number;
  Answer?: DnsAnswer[];
}

async function dnsQuery(
  domain: string,
  type: "MX" | "A" | "AAAA",
): Promise<DnsResponse> {
  const url = new URL("https://cloudflare-dns.com/dns-query");
  url.searchParams.set("name", domain);
  url.searchParams.set("type", type);
  const response = await fetch(url, {
    headers: { Accept: "application/dns-json" },
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`DNS lookup returned HTTP ${response.status}`);
  return (await response.json()) as DnsResponse;
}

function hasAnswer(result: DnsResponse, type: number): boolean {
  return (
    result.Status === 0 &&
    Boolean(
      result.Answer?.some((answer) => answer.type === type && answer.data),
    )
  );
}

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  } catch {
    return NextResponse.json(
      { valid: false, reason: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!validateEmailSyntax(email)) {
    return NextResponse.json(
      { valid: false, reason: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const domain = emailDomain(email)!;
  if (isDisposableEmailDomain(domain)) {
    return NextResponse.json(
      {
        valid: false,
        domain,
        reason: "Temporary or disposable email addresses are not accepted.",
      },
      { status: 400 },
    );
  }

  try {
    const mx = await dnsQuery(domain, "MX");
    if (hasAnswer(mx, 15)) {
      return NextResponse.json({ valid: true, normalizedEmail: email, domain });
    }
    if (mx.Status === 3) {
      return NextResponse.json(
        { valid: false, domain, reason: "This email domain does not exist." },
        { status: 400 },
      );
    }

    // RFC mail delivery permits an address record fallback when MX is absent.
    const [a, aaaa] = await Promise.all([
      dnsQuery(domain, "A"),
      dnsQuery(domain, "AAAA"),
    ]);
    if (hasAnswer(a, 1) || hasAnswer(aaaa, 28)) {
      return NextResponse.json({ valid: true, normalizedEmail: email, domain });
    }
    return NextResponse.json(
      {
        valid: false,
        domain,
        reason: "This domain is not configured to receive email.",
      },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      {
        valid: false,
        domain,
        reason: "Email verification is temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}
