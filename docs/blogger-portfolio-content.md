# Blogger → portfolio article format

The portfolio continues to use Blogger as its free CMS. A Blogger post may now
contain two kinds of content:

1. Normal HTML, which Blogger displays and indexes.
2. One or more `PORTFOLIO-CONTENT` comment blocks, which Blogger hides and the
   portfolio reads from the full-content API/feed.

Use [`blogger-portfolio-post-template.html`](./blogger-portfolio-post-template.html)
as the copyable starting point for a new post.

## Required syntax

Each locale is contained in one HTML comment:

```html
<!-- PORTFOLIO-CONTENT:en
TITLE: Visible portfolio heading
SLUG: unique-portfolio-url-slug
SEO_DESCRIPTION: Description for search and social previews.
---
<article>
  <p>The complete portfolio-only article.</p>
</article>
END PORTFOLIO-CONTENT -->
```

Keep the opening marker, metadata/body divider (`---`), and closing marker on
their own lines. Metadata values must each remain on one line. Do not place
another HTML comment inside a portfolio block.

## Supported metadata

| Field | Purpose | Fallback |
| --- | --- | --- |
| `TITLE` | On-page article heading | Blogger title |
| `SEO_TITLE` | Browser, Google, Open Graph, and X/Twitter title | `TITLE` |
| `SLUG` | URL after `/blog/` | Blogger permalink slug; translated blocks get a language suffix |
| `EXCERPT` or `SHORT_DESCRIPTION` | Portfolio card description | SEO description |
| `SEO_DESCRIPTION` or `DESCRIPTION` | Search/social description | Text extracted from the article |
| `SEO_KEYWORDS` or `KEYWORDS` | Comma-separated search topics | Blogger keywords and labels |
| `TAGS` | Comma-separated visible tags | Blogger labels |
| `IMAGE` | Absolute social/cover image URL | First image in that locale's content |

## Translations

Repeat the block with a different language code, such as `ur`, `es`, `hi`,
`de`, or `ru`. Give every translation a unique `SLUG`. The parser creates a
separate indexable portfolio URL, adds it to the sitemap, connects the versions
with `hreflang` metadata, and displays translation links on the article page.

## HTML and styling rules

- Semantic HTML such as headings, paragraphs, lists, tables, images, links,
  quotes, and code blocks is supported.
- Inline `style="..."` attributes are retained, but shared CSS belongs in the
  portfolio's `.blog-content` rules in `src/styles/globals.css`.
- `<style>`, `<script>`, document `<head>` metadata, event handlers such as
  `onclick`, and `javascript:` URLs are removed for security.
- Put SEO values in the supported fields rather than adding `<meta>` tags to
  the article body.

## Publishing checklist

1. In Blogger, switch the editor to HTML view and paste the template.
2. Replace both the public Blogger article and each hidden portfolio block.
3. Use a unique, stable slug for every language.
4. Publish the Blogger post.
5. Allow up to 30 minutes for the portfolio cache to refresh.
6. Open every portfolio translation and confirm its heading, description,
   image, and language link before publishing or promoting the post.

The portfolio sorts the feed by publication time and automatically exposes the
newest six posts on the homepage (three cards per page). Older posts remain in
the complete `/blog` archive and sitemap. The homepage and Blogger fetch cache
both revalidate every 1,800 seconds, so no homepage metadata or card list needs
manual editing when a post is published.

## Canonical and duplicate-content policy

The portfolio URL is the intended primary search URL for portfolio articles:

```text
https://zubairdeveloper.com/blog/article-slug
```

The application already reinforces that choice by using a self-referencing
canonical on each portfolio article, linking internally to the portfolio URL,
listing only portfolio URLs in `sitemap.xml`, and using the portfolio URL in
`BlogPosting` structured data.

Do not publish the same complete article as visible content on both Blogger and
the portfolio while letting both copies self-canonicalize. The preferred
authoring method is the template above: keep the complete portfolio article in
the hidden `PORTFOLIO-CONTENT` block and make the visible Blogger post a short,
distinct summary that links readers to the portfolio article.

If an existing Blogger post contains the same complete article, resolve it in
Blogger because this repository cannot change Blogger's response headers or
document `<head>`:

1. Prefer replacing the visible Blogger copy with a short, distinct summary
   and a link to its portfolio URL.
2. If Blogger must remain only a private CMS/source, use Blogger's per-post
   **Custom robots tags → No index** setting for the duplicate post. Do not use
   `robots.txt` as a canonicalization mechanism.
3. If the Blogger theme can emit a correct per-post cross-domain
   `rel="canonical"`, point it to the matching portfolio URL. Do not emit a
   second conflicting canonical.
4. Inspect both URLs in Google Search Console after the change and confirm the
   portfolio URL is Google's selected canonical.

Keep the portfolio article self-canonical even after changing Blogger. Google
treats canonical declarations as signals, so the sitemap, internal links,
structured data, and Blogger-side behavior should all agree.
