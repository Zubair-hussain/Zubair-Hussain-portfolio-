const encoder = new TextEncoder();

export interface ScheduleJwtClaims {
  aud: 'calendly-schedule';
  exp: number;
  iat: number;
  iss: 'zubair-portfolio';
  jti: string;
  sub: 'schedule-call';
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sign(input: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(input));
  return toBase64Url(new Uint8Array(signature));
}

export async function createScheduleJwt(secret: string, nowMs = Date.now(), ttlSeconds = 300) {
  if (secret.length < 32) {
    throw new Error('SCHEDULE_JWT_SECRET must be at least 32 characters.');
  }

  const now = Math.floor(nowMs / 1000);
  const claims: ScheduleJwtClaims = {
    aud: 'calendly-schedule',
    exp: now + ttlSeconds,
    iat: now,
    iss: 'zubair-portfolio',
    jti: crypto.randomUUID(),
    sub: 'schedule-call',
  };

  const header = toBase64Url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = toBase64Url(encoder.encode(JSON.stringify(claims)));
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${await sign(unsigned, secret)}`;
}

export async function verifyScheduleJwt(token: string, secret: string, nowMs = Date.now()) {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return false;

  const expected = await sign(`${header}.${payload}`, secret);
  if (signature !== expected) return false;

  const claims = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as ScheduleJwtClaims;
  const now = Math.floor(nowMs / 1000);
  return (
    claims.iss === 'zubair-portfolio' &&
    claims.aud === 'calendly-schedule' &&
    claims.sub === 'schedule-call' &&
    claims.exp > now
  );
}

export function buildScheduleRedirectUrl(calendlyUrl: string, token: string) {
  const url = new URL(calendlyUrl);
  url.searchParams.set('utm_source', 'portfolio');
  url.searchParams.set('utm_medium', 'secure_redirect');
  url.searchParams.set('utm_campaign', 'schedule_call');
  url.searchParams.set('utm_content', token);
  return url;
}
