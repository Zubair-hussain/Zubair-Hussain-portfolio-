import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAllPosts } from '../src/lib/blog';

describe('Blogger content normalization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('extracts article content from a pasted HTML document and keeps metadata out of excerpts', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        feed: {
          entry: [{
            title: { $t: 'A useful article' },
            content: {
              $t: `<!-- private authoring notes -->
                <!doctype html><html><head>
                  <title>Duplicate browser title</title>
                  <meta name="description" content="An overlong embedded description">
                  <script>alert('no')</script>
                </head><body><header>Duplicate navigation</header><main><article>
                  <h1>Article heading</h1>
                  <p>This is the real article introduction with useful information for readers.</p>
                  <img src="http://blogger.googleusercontent.com/example/s72-c/photo.jpg">
                  <a href="javascript:alert(1)" onclick="alert(1)">Unsafe link</a>
                </article></main><footer>Duplicate footer</footer></body></html>`,
            },
            published: { $t: '2026-09-05T10:00:00.000Z' },
            link: [{ rel: 'alternate', href: 'http://example.blogspot.com/2026/09/useful.html' }],
          }],
        },
      }),
    })));

    const [post] = await getAllPosts();

    expect(post.excerpt).toBe('An overlong embedded description');
    expect(post.seoDescription).toBe('An overlong embedded description');
    expect(post.excerpt).not.toContain('private authoring notes');
    expect(post.excerpt).not.toContain('Duplicate browser title');
    expect(post.excerpt.length).toBeLessThanOrEqual(150);
    expect(post.contentHtml).not.toMatch(/<(?:html|head|body|script|meta)\b/i);
    expect(post.contentHtml).not.toContain('onclick=');
    expect(post.contentHtml).not.toContain('javascript:');
    expect(post.contentHtml).toContain('<h2>Article heading</h2>');
    expect(post.contentHtml).toContain('/s1200/photo.jpg');
    expect(post.contentHtml).toContain('loading="lazy"');
    expect(post.url).toBe('/blog/useful');
    expect(post.sourceUrl).toBe('https://example.blogspot.com/2026/09/useful.html');
  });

  it('uses authored Blogger SEO and keeps only the primary translation pane', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        feed: {
          entry: [{
            title: { $t: 'SEO article title' },
            content: {
              $t: `<!doctype html><html><head>
                <meta name="description" content="The exact Blogger search description for this article.">
                <meta name="keywords" content="Blogger SEO, technical writing, search terms">
                <link rel="alternate" hreflang="de" href="https://example.blogspot.com/article-de.html">
              </head><body><article>
                <div class="langbar"><button data-l="en">English</button><button data-l="de">Deutsch</button></div>
                <div class="pane on" id="p-en"><h1>English heading</h1><p>English article body.</p></div>
                <div class="pane" id="p-de" lang="de"><h2>German heading</h2><p>German article body.</p></div>
              </article></body></html>`,
            },
            category: [{ term: 'Engineering' }],
            published: { $t: '2026-09-07T10:00:00.000Z' },
            link: [{ rel: 'alternate', href: 'https://example.blogspot.com/article.html' }],
          }],
        },
      }),
    })));

    const [post] = await getAllPosts();

    expect(post.excerpt).toBe('The exact Blogger search description for this article.');
    expect(post.seoDescription).toBe('The exact Blogger search description for this article.');
    expect(post.seoKeywords).toEqual([
      'Blogger SEO',
      'technical writing',
      'search terms',
      'Engineering',
    ]);
    expect(post.contentHtml).toContain('English article body.');
    expect(post.contentHtml).not.toContain('German article body.');
    expect(post.contentHtml).not.toContain('Deutsch');
    expect(post.translations).toEqual([
      { lang: 'de', url: 'https://example.blogspot.com/article-de.html' },
    ]);
  });
});
