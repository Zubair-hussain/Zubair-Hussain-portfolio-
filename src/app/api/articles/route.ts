import { NextResponse } from 'next/server';
import { PROFILE } from '@/lib/zubair-profile';
import { getAllPostSummaries } from '@/lib/blog';

export async function GET() {
  const allPosts = await getAllPostSummaries();

  // Card-shaped payload for the home "Articles" grid. Note `url` now points to
  // the on-site reader (/blog/[slug]) so posts render here instead of
  // redirecting to Blogger; `sourceUrl` keeps the original permalink.
  const posts = allPosts.map((post) => ({
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags,
    readTime: post.readTime,
    date: post.date,
    url: post.url,
    sourceUrl: post.sourceUrl,
    trending: post.trending,
  }));

  return NextResponse.json(
    {
      blogHome: PROFILE.socials.blog,
      posts,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
      },
    }
  );
}
