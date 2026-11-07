import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { getAllPostSummaries } from '@/lib/blog';
import { SITE_PAGES } from '@/lib/site-pages';

export const dynamic = 'force-static';
export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const posts = await getAllPostSummaries();
  const latestPostModified = posts[0]?.isoUpdated ? new Date(posts[0].isoUpdated) : new Date();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blogs/${post.slug}`,
    lastModified: post.isoUpdated ? new Date(post.isoUpdated) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const pageEntries: MetadataRoute.Sitemap = SITE_PAGES.map((page) => ({
    url: `${siteUrl}${page.path === '/' ? '' : page.path}`,
    lastModified: page.path === '/' || page.path === '/blogs' ? latestPostModified : new Date(page.updated),
    priority: page.priority,
  }));

  return [
    ...pageEntries,
    ...postEntries,
  ];
}
