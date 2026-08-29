import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CookieConsent from '../src/components/ui/CookieConsent';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const copy: Record<string, string> = {
      message: 'This site uses cookies to enhance your experience.',
      accept: 'Accept',
      decline: 'Decline',
    };

    return copy[key] ?? key;
  },
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      animate: _animate,
      children,
      exit: _exit,
      initial: _initial,
      transition: _transition,
      ...props
    }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props as React.HTMLAttributes<HTMLDivElement>, children),
  },
}));

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.cookie = 'cookie-consent=; Path=/; Max-Age=0';
    window.dataLayer = [];
    window.gtag = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('grants Google Consent Mode v2 storage after accepting cookies', () => {
    const { getByRole } = render(<CookieConsent />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    fireEvent.click(getByRole('button', { name: /accept/i }));

    expect(localStorage.getItem('cookie-consent')).toBe('accepted');
    expect(document.cookie).toContain('cookie-consent=accepted');
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
    expect(window.dataLayer).toContainEqual({
      event: 'cookie_consent_update',
      cookie_consent: 'granted',
    });
  });

  it('denies Google Consent Mode v2 storage after declining cookies', () => {
    const { getByRole } = render(<CookieConsent />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    fireEvent.click(getByRole('button', { name: /decline/i }));

    expect(localStorage.getItem('cookie-consent')).toBe('declined');
    expect(document.cookie).toContain('cookie-consent=declined');
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
    expect(window.dataLayer).toContainEqual({
      event: 'cookie_consent_update',
      cookie_consent: 'denied',
    });
  });
});
