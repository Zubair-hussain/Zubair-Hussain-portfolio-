import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../src/app/api/articles/route';
import { PROFILE } from '../src/lib/zubair-profile';

describe('articles api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps Blogger feed entries into article cards with latest trending metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          feed: {
            entry: [
              {
                id: { $t: 'post-1' },
                title: { $t: 'GTA 6 Map Leak Explained' },
                content: { $t: '<p>Vice City and Leonida details explained for readers.</p>' },
                published: { $t: '2026-08-28T10:00:00.000Z' },
                category: [{ term: 'Gaming' }],
                link: [
                  {
                    rel: 'alternate',
                    href: 'https://zubair-xovato.blogspot.com/2026/08/gta-6-map-leak-explained.html',
                  },
                ],
              },
              {
                id: { $t: 'post-2' },
                title: { $t: 'Cursor Origin vs GitHub' },
                summary: { $t: '<p>Git hosting comparison for 2026.</p>' },
                published: { $t: '2026-08-26T10:00:00.000Z' },
                link: [
                  {
                    rel: 'alternate',
                    href: 'https://zubair-xovato.blogspot.com/2026/08/cursor-origin-vs-github.html',
                  },
                ],
              },
            ],
          },
        }),
      }))
    );

    const response = await GET();
    const data = await response.json();

    expect(data.blogHome).toBe(PROFILE.socials.blog);
    expect(data.posts).toHaveLength(2);
    expect(data.posts[0]).toMatchObject({
      title: 'GTA 6 Map Leak Explained',
      slug: 'gta-6-map-leak-explained',
      // Posts now render on-site instead of redirecting to Blogger.
      url: '/blog/gta-6-map-leak-explained',
      sourceUrl: 'https://zubair-xovato.blogspot.com/2026/08/gta-6-map-leak-explained.html',
      tags: ['Most Recent', 'Trending', 'Gaming'],
      trending: true,
    });
    expect(data.posts[1].tags).toEqual(['Blog']);
    expect(data.posts[1].url).toBe('/blog/cursor-origin-vs-github');
  });

  it('returns an empty post list if Blogger is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 500,
      }))
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      blogHome: PROFILE.socials.blog,
      posts: [],
    });
  });
});
