import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Articles from '../src/components/sections/Articles';
import { PROFILE } from '../src/lib/zubair-profile';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const copy: Record<string, string> = {
      label: 'Blog',
      heading: 'Recent\nArticles',
      read_more: 'Read Article',
    };

    return copy[key] ?? key;
  },
}));

vi.mock('framer-motion', () => ({
  useInView: () => true,
  motion: {
    div: ({
      animate: _animate,
      children,
      initial: _initial,
      transition: _transition,
      ...props
    }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props as React.HTMLAttributes<HTMLDivElement>, children),
    a: ({
      animate: _animate,
      children,
      initial: _initial,
      transition: _transition,
      ...props
    }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('a', props as React.AnchorHTMLAttributes<HTMLAnchorElement>, children),
  },
}));

describe('Articles', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          blogHome: PROFILE.socials.blog,
          posts: [
            {
              id: 'gta-6-map-leak',
              title: 'GTA 6 Map Leak Explained',
              excerpt: 'Vice City, Leonida, CyberLeek claims, and what is confirmed.',
              tags: ['Most Recent', 'Trending', 'Gaming'],
              readTime: '4 min',
              date: 'Aug 28, 2026',
              url: 'https://zubair-xovato.blogspot.com/2026/08/gta-6-map-leak-explained.html',
              trending: true,
            },
            {
              id: 'cursor-origin-vs-github',
              title: 'Cursor Origin vs GitHub',
              excerpt: 'A look at whether Cursor Origin is a real GitHub alternative.',
              tags: ['Blog'],
              readTime: '3 min',
              date: 'Aug 26, 2026',
              url: 'https://zubair-xovato.blogspot.com/2026/08/cursor-origin-vs-github.html',
            },
          ],
        }),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('includes the Blogger homepage redirect as an anchor', async () => {
    render(<Articles />);

    expect(await screen.findByRole('link', { name: /open article: zubair blog home/i })).toHaveAttribute(
      'href',
      PROFILE.socials.blog
    );
    expect(screen.getByRole('link', { name: /^blog home$/i })).toHaveAttribute('href', PROFILE.socials.blog);
  });

  it('renders live Blogger posts with the most recent article marked as trending', async () => {
    render(<Articles />);

    expect(await screen.findByRole('link', { name: /open article: gta 6 map leak explained/i })).toHaveAttribute(
      'href',
      'https://zubair-xovato.blogspot.com/2026/08/gta-6-map-leak-explained.html'
    );
    expect(screen.getByText('Most Recent')).toBeInTheDocument();
    expect(screen.getAllByText('Trending').length).toBeGreaterThan(0);
  });

  it('keeps the original featured articles alongside live Blogger posts', async () => {
    render(<Articles />);

    expect(await screen.findByRole('link', { name: /open article: gta 6 map leak explained/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open article: achieving lighthouse 100 with next\.js 15/i })).toHaveAttribute(
      'href',
      'https://zubair-hussain.github.io/Achieving-Lighthouse-100-with-Next.js-15/'
    );
    expect(screen.getByRole('link', { name: /open article: building production ai voice agents with vapi/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open article: react native performance/i })).toBeInTheDocument();
  });

  it('opens every blog redirect link in a new tab', async () => {
    render(<Articles />);

    const latest = await screen.findByRole('link', { name: /open article: gta 6 map leak explained/i });
    const second = screen.getByRole('link', { name: /open article: cursor origin vs github/i });

    expect(latest).toHaveAttribute('target', '_blank');
    expect(latest).toHaveAttribute('rel', 'noopener noreferrer');
    expect(second).toHaveAttribute('target', '_blank');
    expect(second).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
