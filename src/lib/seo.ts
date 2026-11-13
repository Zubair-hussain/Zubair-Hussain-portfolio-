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

const FAQ_HEADING = /^(faq|faqs|frequently asked questions)\b/i;

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|li|div)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Pull question/answer pairs from an article's "FAQ" / "Frequently asked
 * questions" section: every <h3> under that <h2> is a question and the content
 * up to the next heading is its answer. Returns [] when there is no FAQ.
 */
export function extractFaq(html: string, max = 10): Array<{ question: string; answer: string }> {
  const headings = [...html.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const start = headings.findIndex((m) => m[1] === '2' && FAQ_HEADING.test(htmlToText(m[2])));
  if (start === -1) return [];

  const faq: Array<{ question: string; answer: string }> = [];
  for (let i = start + 1; i < headings.length && faq.length < max; i++) {
    const heading = headings[i];
    if (heading[1] === '2') break; // the FAQ section ended
    const next = headings[i + 1];
    const from = (heading.index ?? 0) + heading[0].length;
    const to = next?.index ?? html.length;
    const question = htmlToText(heading[2]);
    const answer = htmlToText(html.slice(from, to)).slice(0, 1000);
    if (question.length > 3 && answer.length > 10) faq.push({ question, answer });
  }
  return faq;
}
