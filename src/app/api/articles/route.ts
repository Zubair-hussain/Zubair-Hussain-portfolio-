import { NextResponse } from 'next/server';
import { PROFILE } from '@/lib/zubair-profile';

export const runtime = 'edge';

const MAX_POSTS = 12;

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}...` : value;
}

function formatDate(value: string) {
  if (!value) return 'Recent';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function estimateReadTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} min`;
}

export async function GET() {
  try {
    const feedUrl = `${PROFILE.sources.blogFeed}&max-results=${MAX_POSTS}`;
    const response = await fetch(feedUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`Blogger returned ${response.status}`);
    }

    const data = await response.json();
    const entries: any[] = data?.feed?.entry || [];

    const posts = entries.map((entry, index) => {
      const link = (entry.link || []).find((item: any) => item.rel === 'alternate');
      const fullText = stripHtml(entry.content?.$t || entry.summary?.$t || '');
      const categories = (entry.category || [])
        .map((category: any) => category.term)
        .filter(Boolean)
        .slice(0, 3);

      return {
        id: entry.id?.$t || link?.href || `blog-post-${index}`,
        title: stripHtml(entry.title?.$t || 'Untitled Article'),
        excerpt: clamp(fullText, 170),
        tags: index === 0
          ? ['Most Recent', 'Trending', ...(categories.length ? categories.slice(0, 1) : ['Blog'])]
          : categories.length
            ? categories
            : ['Blog'],
        readTime: estimateReadTime(fullText),
        date: formatDate(entry.published?.$t || entry.updated?.$t || ''),
        url: link?.href || PROFILE.socials.blog,
        trending: index === 0,
      };
    });

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
  } catch {
    return NextResponse.json(
      {
        blogHome: PROFILE.socials.blog,
        posts: [],
      },
      { status: 200 }
    );
  }
}
