# Monthly crawler and Google indexing audit

The `Monthly Crawler and Search Console Audit` workflow runs on the first day of every month at 03:30 UTC and can also be started manually from GitHub Actions.

Every run downloads `robots.txt` and the sitemap, visits every sitemap URL as Googlebot, and checks HTTP status, redirects, canonical tags, and `noindex` directives. It also verifies that the homepage contains exactly one `ProfilePage` and one `Person`, and that `ProfilePage.mainEntity` references the existing `#person` entity.

## Enable Search Console index checks

The crawler checks work without credentials. To include Google's actual index verdict for every sitemap URL:

1. Enable the **Google Search Console API** in a Google Cloud project.
2. Create a service account and JSON key.
3. In Google Search Console, add the service account email as a user of the portfolio property.
4. Add the complete JSON key as a GitHub Actions secret named `GOOGLE_SEARCH_CONSOLE_CREDENTIALS`.
5. If the Search Console property is not the default URL-prefix property, add a repository variable named `SEARCH_CONSOLE_SITE_URL`. Use the exact property value, such as `sc-domain:example.com` for a domain property.

Treat the JSON key as a password and rotate it if it is exposed. When the secret is absent, the report clearly marks Search Console inspection as not configured; the crawler portion still runs.

## Results

Each run writes its summary to the GitHub Actions job summary and uploads `indexing-audit-report.md` for 90 days. An unresponsive, redirected, non-canonical, blocked, or not-indexed sitemap URL fails the workflow and opens or updates a GitHub issue.

The URL Inspection API reports the version currently known to Google's index; it does not perform a live indexing request or force Google to crawl a page. After deploying a structured-data fix, use Search Console's validation flow manually for the affected issue.

## New-blog SEO readiness email

The `New Blog SEO Readiness Audit` workflow checks the production sitemap hourly and keeps a cached baseline of blog URLs. Its first run only creates the baseline. On later runs, each newly discovered `/blog/` URL is checked for an HTTP 200 response, canonical URL, indexability, title, description, one H1, Open Graph and X/Twitter metadata, and Article/BlogPosting structured data.

When every newly discovered post passes, the workflow emails the URLs to `AUDIT_EMAIL_TO` and tells the recipient to submit them manually with Search Console's URL Inspection screen. Failed posts do not produce a readiness email; their report is available as a workflow artifact. The workflow never calls a Google API and does not submit a sitemap or request indexing.

Email uses the required `AUDIT_EMAIL_USERNAME`, `AUDIT_EMAIL_PASSWORD`, and `AUDIT_EMAIL_TO` secrets documented in `automated-security-audits.md`. `AUDIT_SMTP_SERVER` and `AUDIT_SMTP_PORT` remain optional. A post that fails its audit, or whose email cannot be delivered, remains outside the saved baseline so the workflow retries it on the next run.
