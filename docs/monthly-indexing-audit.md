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

## Automatic Blogger sitemap submission

The `Blogger Sitemap Submission` workflow checks the production sitemap hourly. It hashes the URL set and submits `sitemap.xml` through the authenticated Search Console API only when the set changes, such as after a new Blogger post appears. Successfully submitted URL sets are cached, so unchanged sitemaps are not repeatedly submitted.

This workflow uses the same `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` secret and `SEARCH_CONSOLE_SITE_URL` variable described above. Because sitemap submission needs write access, the service account authorizes the `webmasters` scope. A missing credential or rejected submission fails the workflow and opens one GitHub issue without adding repeated comments every hour.

Google's general Indexing API is restricted to job-posting and livestream pages, so it must not be used for ordinary blog posts. Sitemap submission informs Google about the changed sitemap but does not guarantee or force indexing.
