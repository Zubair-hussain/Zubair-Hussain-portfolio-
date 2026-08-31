import { ImageResponse } from 'next/og';
import { PROFILE } from '@/lib/zubair-profile';

export const alt = 'Zubair Hussain — Full Stack Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Dynamic social-share image (Open Graph + Twitter). Generated at the edge —
// no static asset required, always on-brand.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(1000px 500px at 78% 12%, rgba(99,84,214,0.35), transparent 60%), #0a0a0f',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: '#f5f4f0', letterSpacing: -1 }}>
            ZH
          </span>
          <span style={{ fontSize: 40, fontWeight: 800, color: '#635cd6' }}>.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 22,
              color: '#9a92e6',
              textTransform: 'uppercase',
              letterSpacing: 4,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 99, background: '#635cd6' }} />
            Available for hire
          </div>
          <div style={{ fontSize: 92, fontWeight: 800, color: '#f5f4f0', lineHeight: 1.02 }}>
            {PROFILE.name}
          </div>
          <div style={{ fontSize: 38, color: 'rgba(245,244,240,0.75)' }}>{PROFILE.role}</div>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 24, color: 'rgba(245,244,240,0.55)' }}>
          <span>React</span><span style={{ color: '#635cd6' }}>·</span>
          <span>Next.js</span><span style={{ color: '#635cd6' }}>·</span>
          <span>Node.js</span><span style={{ color: '#635cd6' }}>·</span>
          <span>AI</span><span style={{ color: '#635cd6' }}>·</span>
          <span>UI/UX</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
