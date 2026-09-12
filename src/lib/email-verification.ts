export interface EmailVerificationResult {
  valid: boolean;
  normalizedEmail?: string;
  reason?: string;
  domain?: string;
}

const disposableDomains = new Set([
  "10minutemail.com",
  "dispostable.com",
  "guerrillamail.com",
  "mailinator.com",
  "moakt.com",
  "sharklasers.com",
  "temp-mail.org",
  "tempmail.com",
  "throwawaymail.com",
  "yopmail.com",
]);

export function normalizeEmail(value: string): string {
  return String(value).trim().toLowerCase();
}

export function emailDomain(value: string): string | null {
  const email = normalizeEmail(value);
  const separator = email.lastIndexOf("@");
  return separator > 0 ? email.slice(separator + 1) : null;
}

export function validateEmailSyntax(value: string): boolean {
  const email = normalizeEmail(value);
  if (email.length > 254) return false;
  const separator = email.lastIndexOf("@");
  if (separator <= 0 || separator !== email.indexOf("@")) return false;

  const local = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  if (
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  ) {
    return false;
  }
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false;
  if (domain.length > 253 || !domain.includes(".")) return false;
  return domain
    .split(".")
    .every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-z0-9-]+$/i.test(label) &&
        !label.startsWith("-") &&
        !label.endsWith("-"),
    );
}

export function isDisposableEmailDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().replace(/\.$/, "");
  return disposableDomains.has(normalized);
}

export async function verifyEmailAddress(
  email: string,
): Promise<EmailVerificationResult> {
  const response = await fetch("/api/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const result = (await response.json()) as EmailVerificationResult;
  if (!response.ok && response.status >= 500) {
    throw new Error(
      result.reason || "Email verification is temporarily unavailable.",
    );
  }
  return result;
}
