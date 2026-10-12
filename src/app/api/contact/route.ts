import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  location: z.string().trim().min(2).max(120),
  category: z.string().trim().min(1).max(40),
  details: z.string().trim().min(10).max(2000),
  suggestedTimeline: z.string().trim().max(240).nullable(),
  selectedService: z.string().trim().max(120),
  selectedPrice: z.string().trim().max(80),
  turnstileToken: z.string().min(1).max(2048),
});

async function verifyTurnstile(token: string, remoteIp: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return false;

  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteIp) form.set('remoteip', remoteIp);

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: form, signal: AbortSignal.timeout(6000) },
  );
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function POST(request: Request) {
  try {
    const data = schema.parse(await request.json());
    if (!(await verifyTurnstile(data.turnstileToken, request.headers.get('cf-connecting-ip')))) {
      return NextResponse.json({ error: 'Human verification failed.' }, { status: 403 });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      return NextResponse.json({ error: 'Contact service is unavailable.' }, { status: 503 });
    }

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          from_name: data.name,
          from_email: data.email,
          location: data.location,
          category: data.category,
          message: data.details,
          suggested_timeline: data.suggestedTimeline || 'Not available',
          selected_service: data.selectedService || 'Not specified',
          selected_price: data.selectedPrice || 'Not specified',
        },
      }),
    });

    if (!emailResponse.ok) {
      return NextResponse.json({ error: 'Unable to send your message.' }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to send your message.' }, { status: 500 });
  }
}
