'use client';

import { useTranslations } from 'next-intl';
import { Github, Instagram, Linkedin, Youtube } from 'lucide-react';
import { PROFILE } from '@/lib/zubair-profile';

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.3 22H3.2l7.3-8.3L2.8 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L8.3 3.9H6.5L17.8 20Z" />
    </svg>
  );
}

const socials = [
  { icon: Youtube,   href: PROFILE.socials.youtube,   label: 'YouTube' },
  { icon: Instagram, href: PROFILE.socials.instagram, label: 'Instagram' },
  { icon: XIcon,     href: PROFILE.socials.x,         label: 'X' },
  { icon: Linkedin,  href: PROFILE.socials.linkedin,  label: 'LinkedIn' },
  { icon: Github,    href: PROFILE.socials.github,    label: 'GitHub' },
];

const footerLinks = [
  { label: 'About',    href: '/#about' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Services', href: '/#services' },
  { label: 'Blog',     href: '/blogs' },
];

// Clears the stored choice so the consent banner is shown again on reload.
function resetCookieConsent() {
  try {
    localStorage.removeItem('cookie-consent');
  } catch {
    // Storage unavailable; the cookie reset below still applies.
  }
  document.cookie = 'cookie-consent=; Path=/; Max-Age=0; SameSite=Lax';
  window.location.reload();
}

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[hsl(var(--border))] py-12"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: logo + copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border border-[hsl(var(--primary))] flex items-center justify-center">
                <span className="font-display text-xs font-bold text-[hsl(var(--primary))]">ZH</span>
              </div>
              <span className="font-body font-semibold text-xs tracking-widest uppercase">
                Zubair Hussain
              </span>
            </div>
            <p className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
              &copy; {year} {t('rights')}
            </p>
          </div>

          {/* Center: nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-6">
              {footerLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-xs font-mono tracking-wider uppercase text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/video-editing-services" className="text-xs font-mono tracking-wider uppercase text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-200">
                  {t('videoEditing')}
                </a>
              </li>
              <li>
                <a href="/graphic-design-services" className="text-xs font-mono tracking-wider uppercase text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-200">
                  {t('graphicDesign')}
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="text-xs font-mono tracking-wider uppercase text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-200"
                >
                  {t('privacy')}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={resetCookieConsent}
                  className="text-xs font-mono tracking-wider uppercase text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-200"
                >
                  {t('cookieSettings')}
                </button>
              </li>
            </ul>
          </nav>

          {/* Right: socials */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors duration-200"
                aria-label={`${label} (opens in new tab)`}
              >
                <Icon size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Built with */}
        <div className="mt-8 pt-6 border-t border-[hsl(var(--border))] text-center">
          <p className="text-xs font-mono text-[hsl(var(--muted-foreground)/0.5)]">
            {t('built')} · Lighthouse 100/100 · Hyderabad, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
