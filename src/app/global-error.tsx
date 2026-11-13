'use client'; // Error boundaries must be Client Components

/**
 * Last-resort fallback when the root layout itself fails. It replaces the whole
 * document, so it carries its own <html>, <body> and inline styles.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#050505',
          color: '#f5f4f0',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
        }}
      >
        <title>Something went wrong | Zubair Hussain</title>
        <main style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 32, fontWeight: 400 }}>This page did not load.</h1>
          <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
            Something went wrong on our side. Try again, or go back to the home page.
          </p>
          <p style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{ padding: '10px 18px', borderRadius: 999, border: 0, cursor: 'pointer' }}
            >
              Try again
            </button>
            {/* A full reload is intended here: the app shell itself has failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ padding: '10px 18px', color: '#f5f4f0' }}>
              Home
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
