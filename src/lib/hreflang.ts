/**
 * Translation graph + hreflang helpers shared by the article page and the
 * sitemap, so both always emit the same, reciprocal annotations.
 *
 * Rules enforced here:
 *  - every translation link points at the canonical /blogs/<slug> URL, never at
 *    the legacy /blog/ route (which 301s) or an absolute zubairhussain.xyz URL;
 *  - links are symmetric: if A lists B, B lists A;
 *  - hreflang only ever lists on-site articles that really exist;
 *  - each article is self-referencing and the set carries an x-default.
 */
interface Translatable {
  slug: string;
  lang: string;
  translations: Array<{ lang: string; url: string }>;
}

const SITE_HOSTS = /^https?:\/\/(?:www\.)?zubairhussain\.xyz/i;

/** Map any /blog/<slug> or absolute own-site URL to the canonical /blogs/<slug> path. */
export function canonicalArticlePath(url: string): string {
  const path = url.replace(SITE_HOSTS, "");
  return path.replace(/^\/blog\//, "/blogs/").replace(/[?#].*$/, "").replace(/\/+$/, "");
}

const isOnSite = (url: string) => url.startsWith("/blogs/");

export function reconcileTranslations<T extends Translatable>(posts: T[]): T[] {
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const edges = new Map<string, Map<string, string>>(); // slug -> lang -> path
  const external = new Map<string, Array<{ lang: string; url: string }>>();

  const link = (from: string, lang: string, path: string) => {
    if (!edges.has(from)) edges.set(from, new Map());
    const langs = edges.get(from)!;
    if (!langs.has(lang)) langs.set(lang, path);
  };

  for (const post of posts) {
    for (const translation of post.translations) {
      const path = canonicalArticlePath(translation.url);
      if (!isOnSite(path)) {
        if (!external.has(post.slug)) external.set(post.slug, []);
        external.get(post.slug)!.push(translation);
        continue;
      }
      const target = bySlug.get(path.slice("/blogs/".length));
      if (!target || target.slug === post.slug) continue;
      link(post.slug, target.lang, path);
      link(target.slug, post.lang, `/blogs/${post.slug}`); // reciprocity
    }
  }

  return posts.map((post) => ({
    ...post,
    translations: [
      ...[...(edges.get(post.slug) ?? [])]
        .filter(([lang]) => lang !== post.lang)
        .map(([lang, url]) => ({ lang, url })),
      ...(external.get(post.slug) ?? []),
    ],
  }));
}

/** hreflang map for one article: self, on-site translations, x-default. */
export function hreflangFor(post: Translatable, siteUrl: string): Record<string, string> {
  const self = `${siteUrl}/blogs/${post.slug}`;
  const others = post.translations
    .map((t) => ({ lang: t.lang, path: canonicalArticlePath(t.url) }))
    .filter((t) => isOnSite(t.path) && t.lang !== post.lang);
  if (others.length === 0) return {};

  const languages: Record<string, string> = { [post.lang]: self };
  for (const { lang, path } of others) languages[lang] ??= `${siteUrl}${path}`;
  const english = languages.en;
  if (english) languages["x-default"] = english;
  return languages;
}
