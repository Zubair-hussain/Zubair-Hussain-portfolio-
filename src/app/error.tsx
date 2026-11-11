'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Shown when a page or article fails to render. The navigation links are plain
 * anchors so visitors and crawlers still have a way out of a broken page.
 */
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="section-padding flex min-h-screen items-center">
      <title>Something went wrong | Zubair Hussain</title>
      <div className="container-custom max-w-2xl">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-[hsl(var(--primary))]">Error</p>
        <h1 className="mt-4 font-display text-4xl font-light sm:text-6xl">This page did not load.</h1>
        <p className="mt-5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          Something went wrong while loading this page. Try again, or use one of the links below.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => retry()} className="btn-primary text-xs">
            Try again
          </button>
          <Link href="/" className="btn-outline text-xs">Home</Link>
          <Link href="/blogs" className="btn-outline text-xs">Articles</Link>
        </div>
      </div>
    </main>
  );
}
