export const runtime = 'edge';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-black mb-4 gradient-text">404</h1>
      <h2 className="text-2xl font-bold mb-6 text-foreground">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="btn-primary rounded-full px-8 py-3 font-medium transition-transform hover:scale-105"
      >
        Return Home
      </Link>
    </div>
  );
}
