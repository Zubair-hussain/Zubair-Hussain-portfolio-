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
   image, and language link before requesting indexing in Search Console.
