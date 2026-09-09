import { createSign } from 'node:crypto';

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

export async function getGoogleAccessToken(credentials, scope) {
  if (!credentials?.client_email || !credentials?.private_key) {
    throw new Error('Google credentials must be a service-account JSON key.');
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenUri = credentials.token_uri || 'https://oauth2.googleapis.com/token';
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope,
      aud: tokenUri,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(credentials.private_key, 'base64url')}`;
  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(
      `Google OAuth failed (${response.status}): ${body.error_description || body.error || 'unknown error'}`,
    );
  }
  return body.access_token;
}
