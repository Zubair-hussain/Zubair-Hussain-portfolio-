/**
 * Server-side project-timeline suggestion.
 * Runs on the Cloudflare edge so no API key is ever exposed to the browser.
 * Uses Workers AI when available, with a deterministic fallback otherwise.
 */
import { NextResponse } from 'next/server';


const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct';

function fallback(category: string): string {
  const c = (category || '').toLowerCase();
  if (c.includes('mobile') || c.includes('app')) return '4-8 weeks (based on typical mobile app scope)';
  if (c.includes('ai') || c.includes('bot')) return '3-6 weeks (based on AI integration complexity)';
  if (c.includes('ecommerce') || c.includes('commerce') || c.includes('shop')) return '4-7 weeks (based on store complexity)';
  if (c.includes('landing') || c.includes('page')) return '1-2 weeks (based on a focused landing build)';
  return '2-4 weeks (based on project complexity)';
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const category = String(body?.category || '').slice(0, 120);
  const location = String(body?.location || '').slice(0, 120);

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    type AIBinding = { run: (model: string, options: Record<string, unknown>) => Promise<{ response?: string }> };
    const env = (await getCloudflareContext({ async: true })).env as { AI?: AIBinding };
    if (env?.AI) {
      const out = await env.AI.run(AI_MODEL, {
        messages: [
          {
            role: 'system',
            content:
              'You are a senior project manager. Given a project category and client location, reply with ONE short line: a realistic timeline range and a brief reason. Max 20 words. No preamble.',
          },
          { role: 'user', content: `Category: ${category}\nLocation: ${location}` },
        ],
        max_tokens: 48,
        temperature: 0.6,
      });
      const text = (out?.response || '').trim();
      if (text) return NextResponse.json({ suggestion: text });
    }
  } catch {
    /* fall through to deterministic fallback */
  }

  return NextResponse.json({ suggestion: fallback(category) });
}
