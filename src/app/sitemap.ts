import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { getAllPosts } from '@/lib/blog';
import { hreflangFor } from '@/lib/hreflang';
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

  const latestPostModified = posts.reduce<Date>((latest, post) => {
    const updated = post.isoUpdated ? new Date(post.isoUpdated) : null;
    return updated && updated > latest ? updated : latest;
  }, new Date(0));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const url = `${siteUrl}/blogs/${post.slug}`;
    const languages = hreflangFor(post, siteUrl);
    const hasAlternates = Object.keys(languages).length > 0;

    return {
      url,
      lastModified: post.isoUpdated ? new Date(post.isoUpdated) : new Date(),
      changeFrequency: 'weekly',
      priority: post.lang === 'en' ? 0.7 : 0.5,
      ...(hasAlternates ? { alternates: { languages } } : {}),
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
