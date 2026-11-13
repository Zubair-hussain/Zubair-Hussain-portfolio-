/**
 * Search-engine overrides for individual articles.
 *
 * Articles are written on Blogger and pulled in at build time, so edits made to
 * the generated JSON would be lost on the next rebuild. This file is the
 * portfolio-side layer for SEO fixes driven by Search Console data:
 *   - shorter titles (≤ 60 chars) so Google does not truncate them
 *   - descriptions ≤ 155 chars that answer the searcher's question
 *   - a quick-answer box and extra FAQ entries for queries the article already
 *     covers deep in the text
 *
 * Every figure below is taken from the article itself — do not add new claims
 * here without updating the article on Blogger as well.
 */
import type { BlogPost } from "@/lib/blog";

interface SeoOverride {
  seoTitle?: string;
  seoDescription?: string;
  /** Trusted static HTML placed at the very top of the article body. */
  prependHtml?: string;
  /** Trusted static HTML (<h3> question + answer) inserted at the start of the FAQ section. */
  faqHtml?: string;
}

const OVERRIDES: Record<string, SeoOverride> = {
  // Positions 6–7 with 64 impressions split across two URLs, 0 clicks.
  "new-ai-models-october-2026-claude-duet-gemini-4-gpt-6-1-terra": {
    seoTitle: "New AI Models Oct 2026: Claude Duet, Gemini 4, GPT-6.1 Terra",
    seoDescription:
      "Every AI model launched in October 2026 compared: Claude Duet, Gemini 4 Argon and Carbon, and GPT-6.1 Terra. Release dates, access, specs and safety.",
  },

  // Position 8.3, 0 clicks; the old title ran to 79 characters.
  "claude-opus-5-5-ai-state-of-the-union-2026": {
    seoTitle: "Claude Opus 5.5 vs GPT-6 vs Gemini 3.8: 2026 AI Comparison",
    seoDescription:
      "Claude Opus 5.5 leads Terminal-Bench 4.0 at 66.4%. See how it compares with GPT-6 Astra, Sol and Luna, Gemini 3.8 and Grok 4.7 on price and context.",
  },

  // Position 6.5, 0 clicks.
  "jev-typesafe-system-one-model-explained": {
    seoTitle: "Jev by TypeSafe Explained: Typed AI Decisions, Not Text",
    seoDescription:
      "Jev by TypeSafe AI returns typed decisions with probabilities instead of text. How it works, code examples, limits and when to use it over an LLM.",
  },

  // Security queries (php2shell, php shell) at positions 12–55.
  "php2shell-php-vulnerability-check-guide": {
    seoTitle: "PHP2Shell Fix: Check Your PHP Version & Patch (CVE-2026-109618)",
    seoDescription:
      "Is your server vulnerable to PHP2Shell? Patched versions are PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35. Commands to check your server and what to do today.",
  },

  // Six "chatgpt water usage" queries at positions 63–96: the answers people
  // search for (per query, per day) were buried in the middle of the article.
  "chatgpt-water-usage-sam-altman-claim": {
    seoTitle: "ChatGPT Water Usage Per Query & Per Day: 0.32 mL Checked",
    seoDescription:
      "How much water does ChatGPT use? OpenAI says 0.32 mL per query, independent estimates say 0.6–17 mL, and at 700M queries that is ~225,000 litres a day.",
    prependHtml: `
<aside class="seo-quick-answer" aria-label="Quick answer">
  <p><strong>Quick answer</strong></p>
  <ul>
    <li><strong>Per query:</strong> about <strong>0.32 mL</strong> by Sam Altman's figure (0.000085 US gallons). Independent estimates for GPT-4o class models range from roughly <strong>0.6 mL to 17 mL</strong> per prompt.</li>
    <li><strong>Per day:</strong> at a widely cited 700 million queries a day, 0.32 mL works out to about <strong>225,000 litres per day</strong> (about 82 million litres a year).</li>
    <li><strong>Why estimates differ:</strong> on-site cooling only stays under 1 mL per prompt; counting the water used to generate the electricity gives 7–48 mL.</li>
  </ul>
</aside>`,
    faqHtml: `
<h3>How much water does ChatGPT use per day?</h3>
<p>Using OpenAI's own 0.32 mL per query and a widely cited 700 million queries per day, ChatGPT uses about 225,000 litres of water per day, or roughly 82 million litres a year. Per query it is tiny; in total it is a municipal-scale water bill concentrated in a few data center locations.</p>
<h3>How much water does one ChatGPT question use?</h3>
<p>One question uses about 0.32 mL of water by OpenAI's figure, roughly five drops. Independent estimates range from about 0.6 mL to 17 mL per prompt, and up to 48 mL when the water used to generate the electricity is counted.</p>`,
  },
};

const FAQ_H2 = /<h2\b[^>]*>\s*(?:<[^>]+>\s*)*(?:faq|faqs|frequently asked questions)\b[\s\S]*?<\/h2>/i;

/** Apply the overrides above to a post (English originals only). */
export function applySeoOverride(post: BlogPost): BlogPost {
  const override = OVERRIDES[post.slug];
  if (!override || post.lang !== "en") return post;

  let contentHtml = post.contentHtml;
  if (override.faqHtml && FAQ_H2.test(contentHtml)) {
    contentHtml = contentHtml.replace(FAQ_H2, (heading) => heading + override.faqHtml);
  }
  if (override.prependHtml) contentHtml = override.prependHtml + contentHtml;

  return {
    ...post,
    seoTitle: override.seoTitle ?? post.seoTitle,
    seoDescription: override.seoDescription ?? post.seoDescription,
    contentHtml,
  };
}

export function applySeoOverrides(posts: BlogPost[]): BlogPost[] {
  return posts.map(applySeoOverride);
}
