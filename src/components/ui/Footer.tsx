'use client';

import { useTranslations } from 'next-intl';
import { Github, Linkedin, Twitter } from 'lucide-react';

const socials = [
  { icon: Github,   href: 'https://github.com/zubairdeveloper',   label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/zubairdeveloper', label: 'LinkedIn' },
  { icon: Twitter,  href: 'https://twitter.com/zubairdeveloper',   label: 'Twitter' },
];

const footerLinks = [
  { label: 'About',    href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
];

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
