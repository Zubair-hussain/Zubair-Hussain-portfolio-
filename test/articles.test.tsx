import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import Articles, { type Article } from '../src/components/sections/Articles';

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

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children?: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('framer-motion', () => {
  const strip = ({
    animate: _animate,
    initial: _initial,
    transition: _transition,
    whileHover: _whileHover,
    whileInView: _whileInView,
    viewport: _viewport,
    ...rest
  }: Record<string, unknown>) => rest;

  // `motion` is both an object (motion.div) and a factory (motion(Link)); the
  // mock supports both so the <Card> component renders in jsdom.
  const factory = (Component: React.ElementType) => {
    const MockMotionComponent = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement(Component, strip(props), children);
    MockMotionComponent.displayName = `MockMotion(${typeof Component === 'string' ? Component : 'Component'})`;
    return MockMotionComponent;
  };

  // Real framer-motion exposes both motion(Component) and motion.create(Component).
  return {
    useInView: () => true,
    motion: Object.assign(factory, {
      div: factory('div'),
      a: factory('a'),
      article: factory('article'),
      create: factory,
    }),
  };
});

describe('Articles', () => {
  const initialArticles: Article[] = [
    {
      slug: 'gta-6-map-leak-explained',
      title: 'GTA 6 Map Leak Explained',
      excerpt: 'Vice City, Leonida, CyberLeek claims, and what is confirmed.',
      tags: ['Most Recent', 'Trending', 'Gaming'],
      date: '2026-08-28T10:00:00.000Z',
    },
    {
      slug: 'cursor-origin-vs-github',
      title: 'Cursor Origin vs GitHub',
      excerpt: 'A look at whether Cursor Origin is a real GitHub alternative.',
      tags: ['Blog'],
      date: '2026-08-26T10:00:00.000Z',
    },
  ];

  it('links the section header to the internal blog index', async () => {
    render(<Articles initialArticles={initialArticles} />);

    expect(await screen.findByRole('link', { name: /open article: gta 6 map leak explained/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^blog home$/i })).toHaveAttribute('href', '/blog');
  });

  it('renders live Blogger posts as on-site reader links with the most recent marked trending', async () => {
    render(<Articles initialArticles={initialArticles} />);

    expect(await screen.findByRole('link', { name: /open article: gta 6 map leak explained/i })).toHaveAttribute(
      'href',
      '/blog/gta-6-map-leak-explained'
    );
    expect(screen.getByText('Most Recent')).toBeInTheDocument();
    expect(screen.getAllByText('Trending').length).toBeGreaterThan(0);
  });

  it('lists only real on-site blog posts (no external placeholder cards)', async () => {
    render(<Articles initialArticles={initialArticles} />);

    expect(await screen.findByRole('link', { name: /open article: gta 6 map leak explained/i })).toBeInTheDocument();
    // The old hardcoded github.io "featured" cards are gone.
    expect(screen.queryByRole('link', { name: /achieving lighthouse 100/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open article: zubair blog home/i })).not.toBeInTheDocument();
  });

  it('keeps live Blogger posts on-site (no new-tab redirect to Blogger)', async () => {
    render(<Articles initialArticles={initialArticles} />);

    const latest = await screen.findByRole('link', { name: /open article: gta 6 map leak explained/i });
    const second = screen.getByRole('link', { name: /open article: cursor origin vs github/i });

    expect(latest).toHaveAttribute('href', '/blog/gta-6-map-leak-explained');
    expect(latest).not.toHaveAttribute('target');
    expect(second).toHaveAttribute('href', '/blog/cursor-origin-vs-github');
    expect(second).not.toHaveAttribute('target');
  });

  it('renders crawlable semantic article markup from server-provided posts', () => {
    const markup = renderToStaticMarkup(
      <Articles
        initialArticles={[
          {
            slug: 'semantic-post',
            title: 'Semantic article title',
            excerpt: 'A meaningful excerpt that is present in the initial HTML.',
            tags: ['SEO'],
            date: '2026-09-22T09:00:00+05:00',
          },
        ]}
      />,
    );

    expect(markup).toContain('<article');
    expect(markup).toContain('<time dateTime="2026-09-22T09:00:00+05:00"');
    expect(markup).toContain('Semantic article title');
    expect(markup).toContain('A meaningful excerpt that is present in the initial HTML.');
    expect(markup.match(/href="\/blog\/semantic-post"/g)).toHaveLength(2);
  });

  it('paginates 3 posts per page, revealing the rest on later pages', async () => {
    const posts = Array.from({ length: 5 }, (_, i) => ({
      slug: `post-${i}`,
      title: `Post Number ${i}`,
      excerpt: `Excerpt ${i}`,
      tags: ['Blog'],
      date: `2026-08-${String(28 - i).padStart(2, '0')}T10:00:00.000Z`,
    }));

    render(<Articles initialArticles={posts} />);

    // Page 1 shows the first 3 only.
    expect(await screen.findByRole('link', { name: /open article: post number 0/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open article: post number 2/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open article: post number 3/i })).not.toBeInTheDocument();

    // Page 2 reveals the remaining 2.
    fireEvent.click(screen.getByRole('button', { name: /page 2/i }));
    expect(await screen.findByRole('link', { name: /open article: post number 3/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open article: post number 4/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open article: post number 0/i })).not.toBeInTheDocument();
  });

  it('limits the homepage to the six newest posts', async () => {
    const posts = Array.from({ length: 8 }, (_, i) => ({
      slug: `limited-post-${i}`,
      title: `Limited Post ${i}`,
      excerpt: `Excerpt ${i}`,
      tags: ['Blog'],
      date: `2026-09-${String(23 - i).padStart(2, '0')}T10:00:00.000Z`,
    }));

    render(<Articles initialArticles={posts} />);

    expect(screen.getByRole('button', { name: /page 2/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /page 3/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /page 2/i }));
    expect(await screen.findByRole('link', { name: /open article: limited post 5/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open article: limited post 6/i })).not.toBeInTheDocument();
  });
});
