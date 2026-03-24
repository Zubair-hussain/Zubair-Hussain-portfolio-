// src/lib/email.ts
import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

export const sendEmail = async (templateParams: Record<string, any>) => {
  // Early validation – prevents silent failures
  if (!SERVICE_ID) throw new Error('Missing NEXT_PUBLIC_EMAILJS_SERVICE_ID');
  if (!TEMPLATE_ID) throw new Error('Missing NEXT_PUBLIC_EMAILJS_TEMPLATE_ID');
  if (!PUBLIC_KEY) throw new Error('Missing NEXT_PUBLIC_EMAILJS_PUBLIC_KEY');

  try {
    console.log('[EmailJS] Attempting to send with:', {
      service: SERVICE_ID,
      template: TEMPLATE_ID,
      publicKeyPrefix: PUBLIC_KEY.substring(0, 6) + '...',
      paramsKeys: Object.keys(templateParams),
    });

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      {
        publicKey: PUBLIC_KEY,           // ← This is the most reliable way in 2025/2026
        // limitRate: { id: 'app', throttle: 10000 } // optional: prevent spam
      }
    );

    console.log('[EmailJS] Success:', response.status, response.text);
    return response;
  } catch (err: any) {
    console.error('[EmailJS] Failed:', {
      message: err.message,
      status: err.status,
      text: err.text,
      stack: err.stack?.substring(0, 300),
    });
    throw err; // let the caller handle UI feedback
  }
};

// Optional: if you want to notify yourself/admin separately (you had this before)
export const notifyAdmin = async (type: 'comment' | 'hire', data: any) => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('[notifyAdmin] No admin email configured');
    return;
  }

  const params = {
    to_email: adminEmail,
    subject: type === 'comment' ? 'New Testimonial for Approval' : 'New Hiring Inquiry',
    message: JSON.stringify(data, null, 2),
  };

  return sendEmail(params);
};