# Monthly portfolio audit

The `Monthly Portfolio Audit` workflow runs on the first day of every month at 03:30 UTC and can also be started manually from GitHub Actions. It only needs the production portfolio URL; no external search-service credentials or repository variables are required.

Every run checks:

- `robots.txt`
- `sitemap.xml`
- HTTP status
- redirects
- canonical tags
- robots and `noindex` directives
- page titles and meta descriptions
- structured data on the homepage

This workflow does not call Google Search Console, does not inspect URLs through Google APIs, and does not request indexing.

## Results

Each run writes its summary to the GitHub Actions job summary and uploads `indexing-audit-report.md` for 90 days. An unavailable resource, redirected or non-canonical sitemap URL, crawl block, missing metadata, or invalid homepage structured data fails the workflow and opens or updates a GitHub issue.

## New-blog SEO readiness email

The `New Blog SEO Readiness Audit` workflow checks the production sitemap hourly and keeps a cached baseline of blog URLs. Its first run only creates the baseline. On later runs, each newly discovered `/blog/` URL is checked for an HTTP 200 response, canonical URL, indexability, title, description, one H1, Open Graph and X/Twitter metadata, and Article/BlogPosting structured data.

When every newly discovered post passes, the workflow creates a branded executive PDF and emails a responsive HTML summary to `AUDIT_EMAIL_TO` if the SMTP secrets are configured. The visual treatment combines a score-led audit layout with the portfolio's black, warm-paper, crimson, editorial identity. Email delivery is an optional notification and cannot fail the SEO audit or prevent the sitemap baseline from being saved. Failed posts do not produce a readiness email; their technical report is available as a workflow artifact. This workflow also performs no URL submission or indexing request.

Email uses `AUDIT_EMAIL_USERNAME`, `AUDIT_EMAIL_PASSWORD`, and `AUDIT_EMAIL_TO` when those secrets are configured, as documented in `automated-security-audits.md`. `AUDIT_SMTP_SERVER` and `AUDIT_SMTP_PORT` remain optional. A post that fails its SEO audit remains outside the saved baseline so the workflow retries it on the next run; an email-delivery problem does not cause repeated audits.
