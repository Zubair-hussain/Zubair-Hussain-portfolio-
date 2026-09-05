/**
 * ============================================================================
 *  BLOG — Shared Blogger data layer
 * ============================================================================
 *  One place that turns the raw Blogger JSON feed into normalized posts that
 *  are rendered natively on this site (NOT redirected to Blogger). Used by:
 *    - /api/articles         (the home "Articles" grid)
 *    - /blog/[slug]          (the native reader page + per-article OG tags)
 *    - /api/chat             (so the AI bot links to the on-site article pages)
 *    - /sitemap.ts           (so every article is indexable)
 *
 *  Because everything reads from here, publishing a new Blogger post makes it
 *  appear on the site, in the bot, and in the sitemap with no code changes.
 * ============================================================================
 */

import { PROFILE } from '@/lib/zubair-profile';

export interface BlogPost {
  /** URL-safe id derived from the Blogger permalink (e.g. gta-6-map-leak-explained). */
  slug: string;
  title: string;
  /** Short, plain-text teaser for cards + meta descriptions. */
  excerpt: string;
  /** Sanitized post body HTML, safe to render with dangerouslySetInnerHTML. */
  contentHtml: string;
  tags: string[];
  readTime: string;
  /** Human-friendly date, e.g. "Aug 28, 2026". */
  date: string;
  /** ISO published date for <time> + structured data. */
  isoDate: string;
  /** ISO last-updated date (may equal isoDate). */
  isoUpdated: string;
  /** On-site reader URL. */
  url: string;
  /** Original Blogger permalink (kept for a "View original" link + canonical). */
  sourceUrl: string;
  /** First image found in the post, used for the OG/Twitter card. */
  image: string | null;
  /** Detected content language (BCP-47), e.g. "en", "ur", "hi". */
  lang: string;
  trending: boolean;
}

interface BloggerTextNode {
  $t?: string;
}

interface BloggerFeedEntry {
  title?: BloggerTextNode;
  content?: BloggerTextNode;
  summary?: BloggerTextNode;
  published?: BloggerTextNode;
  updated?: BloggerTextNode;
  category?: Array<{ term?: string }>;
  link?: Array<{ rel?: string; href?: string }>;
  media$thumbnail?: { url?: string };
}

interface BloggerApiPost {
  id?: string;
  title?: string;
  content?: string;
  published?: string;
  updated?: string;
  url?: string;
  labels?: string[];
  images?: Array<{ url?: string }>;
}

// Blogger caps `max-results` per request, so we page through the feed with
// `start-index` until it's exhausted. PAGE_SIZE is the per-request batch and
// HARD_CAP is a safety ceiling so a huge blog can never spin forever.
const PAGE_SIZE = 25;
const HARD_CAP = 600;
// This portfolio reads from one fixed public blog. Keep the ID here so every
// deployment uses the same source without requiring environment configuration.
const BLOGGER_BLOG_ID = '8399042753426695965';
const BLOGGER_API_KEY = process.env.BLOGGER_API_KEY?.trim();

function feedUrl(startIndex: number, includeContent: boolean) {
  const base = includeContent
    ? PROFILE.sources.blogFeed
    : PROFILE.sources.blogFeed.replace('/posts/default?', '/posts/summary?');
  return `${base}&max-results=${PAGE_SIZE}&start-index=${startIndex}`;
}

function apiUrl(includeContent: boolean, pageToken?: string) {
  const params = new URLSearchParams({
    key: BLOGGER_API_KEY || '',
    fetchBodies: String(includeContent),
    fetchImages: 'true',
    maxResults: '50',
    status: 'live',
  });
  if (pageToken) params.set('pageToken', pageToken);
  return `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts?${params}`;
}

/* ------------------------------- utilities ------------------------------- */

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function stripHtml(value: string) {
  return decodeEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Blogger accepts arbitrary HTML, including complete documents pasted into the
 * editor. Only render the actual article region so embedded metadata, headers,
 * navigation and footers cannot leak into excerpts or create nested documents.
 */
function extractArticleContent(value: string) {
  let content = value.replace(/<!--[\s\S]*?-->/g, ' ').trim();
  const body = content.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (body) content = body[1];

  const article = content.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (article) return article[1].trim();

  const main = content.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return main[1].trim();

  return content;
}

/**
 * Lightweight, dependency-free sanitizer for Blogger post bodies. The content
 * is authored by Zubair (trusted), but we still strip anything script-like so a
 * copied embed can never run in the reader page.
 */
function sanitizeHtml(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<head\b[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<(?:meta|base|title)\b[^>]*>(?:[\s\S]*?<\/(?:meta|base|title)>)?/gi, '')
    .replace(/<\/?(?:html|body)\b[^>]*>/gi, '')
    .replace(/<iframe\b([^>]*)srcdoc\s*=\s*(?:"[^"]*"|'[^']*')[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#'")
    .trim();
}

function clamp(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value;
}

function formatDate(value: string) {
  if (!value) return 'Recent';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Recent';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

function estimateReadTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min`;
}

/** Ensure a URL is absolute + https (Blogger sometimes emits protocol-relative). */
function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('http://')) return trimmed.replace(/^http:\/\//i, 'https://');
  return trimmed;
}

/**
 * Blogger serves images through googleusercontent with a size segment like
 * `/s72-c/` or `/w400-h300/`. Those thumbnails are too small for an OG card, so
 * upgrade them to a large, uncropped size.
 */
function upgradeBloggerImage(url: string): string {
  return normalizeUrl(
    url.replace(
      /\/(?:s\d+(?:-c)?|w\d+-h\d+(?:-[a-z-]+)?|s\d+-w\d+-h\d+)\//i,
      '/s1200/'
    )
  );
}

/** Grab the first real content image (for the OG/Twitter card), OG-sized. */
function firstImage(html: string, thumbnail?: string): string | null {
  const match = html.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
  if (match) return upgradeBloggerImage(match[1]);
  if (thumbnail) return upgradeBloggerImage(thumbnail);
  return null;
}

/**
 * Detect the post's primary language from its script so we can set the correct
 * `lang`/`og:locale` when a post is written in Urdu, Hindi, Russian, etc. Latin
 * text falls back to English.
 */
function detectLang(text: string): string {
  const sample = text.slice(0, 400);
  if (/[؀-ۿ]/.test(sample)) return 'ur'; // Arabic script → Urdu
  if (/[ऀ-ॿ]/.test(sample)) return 'hi'; // Devanagari → Hindi
  if (/[Ѐ-ӿ]/.test(sample)) return 'ru'; // Cyrillic → Russian
  return 'en';
}

/**
 * Make the rendered body SEO- and a11y-friendly:
 *  - keep a single <h1> on the page (demote any in-body h1 to h2),
 *  - give every image an alt fallback + lazy loading + OG-quality src,
 *  - make outbound links safe (rel=noopener) and open in a new tab.
 */
function enhanceContent(html: string, title: string): string {
  return html
    // Only the page title should be an <h1>.
    .replace(/<(\/?)h1(\s|>)/gi, '<$1h2$2')
    // Upgrade + lazy-load images, and ensure an alt attribute exists.
    .replace(/<img\b([^>]*?)\/?>/gi, (_m, attrs: string) => {
      let a = attrs;
      const srcMatch = a.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
      if (srcMatch) {
        a = a.replace(srcMatch[0], `src="${upgradeBloggerImage(srcMatch[1])}"`);
      }
      if (!/\balt\s*=/.test(a)) a += ` alt="${title.replace(/"/g, '')}"`;
      if (!/\bloading\s*=/.test(a)) a += ' loading="lazy"';
      if (!/\bdecoding\s*=/.test(a)) a += ' decoding="async"';
      return `<img${a}>`;
    })
    // Outbound links: safe + new tab.
    .replace(/<a\b([^>]*?)>/gi, (_m, attrs: string) => {
      let a = attrs;
      if (/href\s*=\s*["']https?:/i.test(a)) {
        if (!/\brel\s*=/.test(a)) a += ' rel="noopener noreferrer"';
        if (!/\btarget\s*=/.test(a)) a += ' target="_blank"';
      }
      return `<a${a}>`;
    });
}

/** Derive a stable slug from the Blogger permalink, with sensible fallbacks. */
function slugFromLink(href: string, title: string, index: number): string {
  try {
    const path = new URL(href).pathname; // e.g. /2026/08/gta-6-map-leak-explained.html
    const last = path.split('/').filter(Boolean).pop() || '';
    const cleaned = last.replace(/\.html?$/i, '').trim();
    if (cleaned) return cleaned;
  } catch {
    /* fall through */
  }

  const fromTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return fromTitle || `post-${index + 1}`;
}

/* ------------------------------- fetching -------------------------------- */

function toIso(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function mapEntry(entry: BloggerFeedEntry, index: number): BlogPost {
  const link = (entry.link || []).find((item) => item.rel === 'alternate');
  const sourceUrl = normalizeUrl(link?.href || PROFILE.socials.blog);
  const rawContent = entry.content?.$t || entry.summary?.$t || '';
  const title = stripHtml(entry.title?.$t || 'Untitled Article');
  const articleContent = extractArticleContent(rawContent);
  const contentHtml = enhanceContent(sanitizeHtml(articleContent), title);
  const plainText = stripHtml(articleContent) || title;
  const slug = slugFromLink(sourceUrl, title, index);

  const categories = (entry.category || [])
    .map((category) => category.term)
    .filter((term): term is string => Boolean(term))
    .slice(0, 3);

  const tags =
    index === 0
      ? ['Most Recent', 'Trending', ...(categories.length ? categories.slice(0, 1) : ['Blog'])]
      : categories.length
        ? categories
        : ['Blog'];

  const publishedIso = toIso(entry.published?.$t || entry.updated?.$t || '');
  const updatedIso = toIso(entry.updated?.$t || entry.published?.$t || '');

  return {
    slug,
    title,
    excerpt: clamp(plainText, 150),
    contentHtml,
    tags,
    readTime: estimateReadTime(plainText),
    date: formatDate(entry.published?.$t || entry.updated?.$t || ''),
    isoDate: publishedIso,
    isoUpdated: updatedIso || publishedIso,
    url: `/blog/${slug}`,
    sourceUrl,
    image: firstImage(rawContent, entry.media$thumbnail?.url),
    lang: detectLang(`${title} ${plainText}`),
    trending: index === 0,
  };
}

function mapApiPost(post: BloggerApiPost, index: number): BlogPost {
  return mapEntry(
    {
      title: { $t: post.title || 'Untitled Article' },
      content: { $t: post.content || '' },
      published: { $t: post.published || '' },
      updated: { $t: post.updated || '' },
      category: (post.labels || []).map((term) => ({ term })),
      link: post.url ? [{ rel: 'alternate', href: post.url }] : [],
      media$thumbnail: post.images?.[0]?.url ? { url: post.images[0].url } : undefined,
    },
    index
  );
}

async function getPostsFromApi(includeContent: boolean): Promise<BlogPost[] | null> {
  if (!BLOGGER_API_KEY) return null;

  const posts: BloggerApiPost[] = [];
  let pageToken: string | undefined;

  try {
    do {
      const response = await fetch(apiUrl(includeContent, pageToken), {
        headers: { Accept: 'application/json' },
        next: { revalidate: 1800 },
      });
      if (!response.ok) return null;

      const data = await response.json() as { items?: BloggerApiPost[]; nextPageToken?: string };
      posts.push(...(data.items || []));
      pageToken = data.nextPageToken;
    } while (pageToken && posts.length < HARD_CAP);

    return posts.slice(0, HARD_CAP).map(mapApiPost);
  } catch {
    return null;
  }
}

/**
 * Fetch + normalize EVERY post, paging through the Blogger feed so the count is
 * not capped (a blog with 5 or 200 posts both work). Never throws — returns
 * whatever it collected (possibly []) on any failure.
 */
async function fetchPosts(includeContent: boolean): Promise<BlogPost[]> {
  const apiPosts = await getPostsFromApi(includeContent);
  if (apiPosts?.length) return apiPosts;

  const rawEntries: BloggerFeedEntry[] = [];

  try {
    for (let startIndex = 1; startIndex <= HARD_CAP; startIndex += PAGE_SIZE) {
      const response = await fetch(feedUrl(startIndex, includeContent), {
        headers: { Accept: 'application/json' },
        next: { revalidate: 1800 },
      });
      if (!response.ok) break;

      const data = await response.json() as { feed?: { entry?: BloggerFeedEntry[] } };
      const entries = data.feed?.entry || [];
      if (entries.length === 0) break;

      rawEntries.push(...entries);
      // Last page reached when Blogger returns fewer than a full batch.
      if (entries.length < PAGE_SIZE) break;
    }
  } catch {
    /* return whatever we managed to collect */
  }

  const uniqueSlugs = new Set<string>();
  return rawEntries
    .map(mapEntry)
    .filter((post) => {
      if (uniqueSlugs.has(post.slug)) return false;
      uniqueSlugs.add(post.slug);
      return true;
    });
}

/** Full bodies for the native article reader. */
export async function getAllPosts(): Promise<BlogPost[]> {
  return fetchPosts(true);
}

/** Lightweight cards/SEO records (about 24x smaller than the full feed). */
export async function getAllPostSummaries(): Promise<BlogPost[]> {
  return fetchPosts(false);
}

/** Fetch a single post by slug (null if not found / feed unavailable). */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

/**
 * Pick related posts for the reader page: same-tag matches first, then the most
 * recent others, always excluding the current post.
 */
export function getRelatedPosts(current: BlogPost, all: BlogPost[], limit = 3): BlogPost[] {
  const others = all.filter((post) => post.slug !== current.slug);
  const tagSet = new Set(current.tags.map((tag) => tag.toLowerCase()));

  const sameTag = others.filter((post) => post.tags.some((tag) => tagSet.has(tag.toLowerCase())));
  const rest = others.filter((post) => !sameTag.includes(post));

  return [...sameTag, ...rest].slice(0, limit);
}
