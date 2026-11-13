// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config.mjs';
import { middleware } from '../src/middleware';

describe('301 redirects for Google', () => {
  it('redirects old workers.dev URLs to zubairhussain.xyz with a 301 and keeps path + query', () => {
    const response = middleware(
      new NextRequest(
        'https://zubair-hussain-portfolio.detroonshah.workers.dev/blogs/some-post?lang=ur',
      ),
    );
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe(
      'https://zubairhussain.xyz/blogs/some-post?lang=ur',
    );
  });

  it('also redirects dotted files like sitemap.xml on workers.dev', () => {
    const response = middleware(
      new NextRequest('https://zubair-hussain-portfolio.detroonshah.workers.dev/sitemap.xml'),
    );
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://zubairhussain.xyz/sitemap.xml');
  });

  it('redirects www to the apex domain with one 301', () => {
    const response = middleware(new NextRequest('https://www.zubairhussain.xyz/blogs/a-post?x=1'));
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://zubairhussain.xyz/blogs/a-post?x=1');
  });

  it('redirects http to https on the canonical domain', () => {
    const response = middleware(new NextRequest('http://zubairhussain.xyz/blogs/a-post'));
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://zubairhussain.xyz/blogs/a-post');
  });

  it('does not redirect localhost over http', () => {
    const response = middleware(new NextRequest('http://localhost:3000/blogs'));
    expect(response.headers.get('location')).toBeNull();
  });

  it('does not redirect the canonical domain', () => {
    const response = middleware(new NextRequest('https://zubairhussain.xyz/blogs'));
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects /blog and /blog/:slug to /blogs with status 301 (not 308)', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const list = redirects.find((r: { source: string }) => r.source === '/blog');
    const slug = redirects.find((r: { source: string }) => r.source === '/blog/:slug');
    expect(list).toMatchObject({ destination: '/blogs', statusCode: 301 });
    expect(slug).toMatchObject({ destination: '/blogs/:slug', statusCode: 301 });
    expect(redirects.every((r: { permanent?: boolean }) => r.permanent === undefined)).toBe(true);
  });
});
