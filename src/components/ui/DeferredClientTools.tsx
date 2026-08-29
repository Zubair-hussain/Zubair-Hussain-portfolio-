'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LenisProvider = dynamic(() => import('./LenisProvider'), { ssr: false });
const ScrollProgress = dynamic(() => import('./ScrollProgress'), { ssr: false });
const CustomCursor = dynamic(() => import('./CustomCursor'), { ssr: false });
const AIChatbox = dynamic(() => import('./AIChatbox'), { ssr: false });
const BackToTop = dynamic(() => import('./BackToTop'), { ssr: false });
const CookieConsent = dynamic(() => import('./CookieConsent'), { ssr: false });

export default function DeferredClientTools() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(start, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(start, 1800);
    }

    return () => {
      if ('cancelIdleCallback' in window && idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <LenisProvider />
      <CustomCursor />
      <ScrollProgress />
      <AIChatbox />
      <BackToTop />
      <CookieConsent />
    </>
  );
}
