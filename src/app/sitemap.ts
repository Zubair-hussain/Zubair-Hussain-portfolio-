import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { getAllPostSummaries } from '@/lib/blog';

export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const posts = await getAllPostSummaries();
  const latestPostModified = posts[0]?.isoUpdated ? new Date(posts[0].isoUpdated) : new Date();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.isoUpdated ? new Date(post.isoUpdated) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: latestPostModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: latestPostModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...postEntries,
  ];
}
