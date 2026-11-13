import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { getAllPosts } from '@/lib/blog';
import { SITE_PAGES } from '@/lib/site-pages';

export const dynamic = 'force-static';
export const revalidate = false;

/**
 * Every article in every language, each with hreflang alternates so Google
 * treats translations as one article in several languages instead of
 * competing duplicates. Only canonical https://zubairhussain.xyz/blogs/ URLs
 * are listed (never /blog/, www or http).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const posts = await getAllPosts();
  const absolute = (url: string) => (url.startsWith('http') ? url : `${siteUrl}${url}`);
  const onSite = (url: string) => absolute(url).startsWith(`${siteUrl}/blogs/`);

  const latestPostModified = posts.reduce<Date>((latest, post) => {
    const updated = post.isoUpdated ? new Date(post.isoUpdated) : null;
    return updated && updated > latest ? updated : latest;
  }, new Date(0));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const url = `${siteUrl}/blogs/${post.slug}`;
    const others = post.translations.filter((t) => onSite(t.url));
    const english = post.lang === 'en' ? url : others.find((t) => t.lang === 'en')?.url;
    const languages: Record<string, string> = others.length
      ? Object.fromEntries([
          [post.lang, url],
          ...others.map((t) => [t.lang, absolute(t.url)]),
          ...(english ? [['x-default', absolute(english)]] : []),
        ])
      : {};

    return {
      url,
      lastModified: post.isoUpdated ? new Date(post.isoUpdated) : new Date(),
      changeFrequency: 'weekly',
      priority: post.lang === 'en' ? 0.7 : 0.5,
      ...(others.length ? { alternates: { languages } } : {}),
    };
  });

  const pageEntries: MetadataRoute.Sitemap = SITE_PAGES.map((page) => ({
    url: `${siteUrl}${page.path === '/' ? '' : page.path}`,
    lastModified:
      page.path === '/' || page.path === '/blogs'
        ? latestPostModified.getTime() > 0 ? latestPostModified : new Date()
        : new Date(page.updated),
    priority: page.priority,
  }));

  return [...pageEntries, ...postEntries];
}
