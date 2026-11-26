# zubairhussain.xyz: canonical / hreflang audit (2026-11-26)

## Root cause of the 71 "Alternate page with proper canonical" URLs
The article translations referenced each other through legacy `/blog/<slug>` URLs
(514 links in the snapshot, 100% of them). `/blog/*` 301-redirects to `/blogs/*`, so:
- hreflang annotations pointed at redirecting URLs (invalid; Google discards them);
- the sitemap filtered alternates with `startsWith('/blogs/')`, so ~34 articles
  (every article whose translations used `/blog/`) shipped with **no** alternates;
- translation chips on the page linked to `/blog/...` (internal link -> 301 hop).
Without valid, reciprocal hreflang, Google clusters the near-identical translations
as duplicates and picks one canonical, putting the rest in "Alternate page with proper
canonical". Canonical tags themselves were already self-referencing (verified live).

## Changes
- `src/lib/hreflang.ts` (new): normalises translation URLs to `/blogs/<slug>`,
  enforces reciprocity (A lists B => B lists A), keeps only existing on-site
  articles in hreflang, adds self-reference and `x-default` (English).
- `src/lib/blog.ts`: applies it to the snapshot and live-fallback posts, so page
  links, chips and JSON-LD `workTranslation` all use canonical URLs.
- `src/app/blogs/[slug]/page.tsx`, `src/app/sitemap.ts`: both use the same helper
  (page tags and sitemap can no longer disagree). Sitemap alternates: 546 -> 694.
- `src/middleware.ts`: wrong-host requests (www, workers.dev) now map `/blog/` ->
  `/blogs/` and renamed slugs in the same 301, removing the 2-hop chain.
- `test/hreflang.test.ts`: asserts self-reference, reciprocity, canonical-only, x-default.
Verified locally: translated article renders canonical + 9 hreflang tags with
`/blogs/` URLs; unit tests pass; `tsc` clean.

## Already correct (live checks)
http -> https and www -> apex 301; `/blog/*` -> `/blogs/*` 301 (backlinks preserved);
unknown slug returns a real 404; no `X-Robots-Tag`/noindex; robots.txt allows
Googlebot; sitemap lists only canonical https URLs (113), no `/blog/`.

## Remaining
1. **Redeploy needed**: live site still serves the old output until this ships.
2. `<html lang>` follows the UI locale cookie (en), not the article language.
   `<article lang>`, og:locale, JSON-LD inLanguage are correct. Fixing needs the
   root layout to know the post language (e.g. move article routes under a
   per-article layout); not done to avoid touching site design.
3. 11 translation links point to blogspot.com; kept as visible links but excluded
   from hreflang (not reciprocal).
4. `/blogs/` trailing slash returns 308 (Next default), fine but not 301.
5. Live checks of Cloudflare bot rules were limited to a Googlebot UA via curl;
   verify in Search Console URL Inspection. Don't expect GSC to drop to zero:
   some alternates may remain until Google recrawls (days to weeks).
