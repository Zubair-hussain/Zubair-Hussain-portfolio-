/**
 * Small, pure helpers for search/social metadata. They only shape what goes
 * into <meta> tags and JSON-LD — they never change page data or behaviour.
 */

/** Google shows ~155–160 characters of a meta description on desktop. */
export const META_DESCRIPTION_MAX = 158;

/** Card-only labels added in src/lib/blog.ts that are not real article topics. */
const UI_ONLY_TAGS = new Set(['most recent', 'trending']);

/**
 * Trim a description to fit a search snippet without cutting a word in half.
 * Descriptions that already fit are returned unchanged.
 */
export function metaDescription(value: string, max = META_DESCRIPTION_MAX): string {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;

  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, '');
  return `${trimmed}…`;
}

/** Article topics for og:article:tag / articleSection, minus card-only labels. */
export function topicTags(tags: string[]): string[] {
  return tags.filter((tag) => !UI_ONLY_TAGS.has(tag.toLowerCase()));
}

/** "5 min" → "PT5M" (schema.org timeRequired). */
export function readTimeToIsoDuration(readTime: string): string | undefined {
  const minutes = Number.parseInt(readTime, 10);
  return Number.isFinite(minutes) && minutes > 0 ? `PT${minutes}M` : undefined;
}

/** Serialize JSON-LD safely for an inline <script> (no premature </script>). */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
