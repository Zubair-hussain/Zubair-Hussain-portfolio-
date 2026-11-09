import type { Metadata } from 'next';
import NotFoundView from '@/components/ui/NotFoundView';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
