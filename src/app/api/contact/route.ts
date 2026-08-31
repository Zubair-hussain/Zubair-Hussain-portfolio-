import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(30),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    // Option 1: Resend (recommended)
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'portfolio@zubairdeveloper.com',
    //   to: 'hello@zubairdeveloper.com',
    //   subject: `Portfolio Contact: ${data.subject}`,
    //   html: `<p>From: ${data.name} (${data.email})</p><p>${data.message}</p>`,
    // });

    // Option 2: EmailJS or any SMTP
    console.log('Contact form submission:', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
