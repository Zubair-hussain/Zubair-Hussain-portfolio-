# Automated security and production audits

The `Security and Production Audit` GitHub Actions workflow protects the deployed portfolio and its Blogger-powered article routes.

## When it runs

- After a successful GitHub deployment event.
- After a successful `Build` workflow on `main` or `_prod`, with a 90-second wait for Cloudflare propagation.
- Every Thursday at 03:15 UTC (08:15 Pakistan time).
- Manually from **Actions → Security and Production Audit → Run workflow**.

The manual trigger accepts an optional production URL. For scheduled runs, set the repository variable `PRODUCTION_URL`; otherwise the current Cloudflare Workers URL is used.

## What it checks

1. `npm audit` checks production dependencies for high or critical vulnerabilities.
2. TypeScript verifies application contracts.
3. CodeQL runs the `security-extended` JavaScript/TypeScript queries.
4. The production audit checks the homepage, `robots.txt`, `sitemap.xml`, HTTPS canonicals, description length, and every sitemap URL.
5. Lighthouse checks the homepage and `/blog` for crawlability, console errors, accessibility, best practices, SEO, and performance regressions.

Lighthouse HTML and JSON reports are retained as workflow artifacts for 30 days.

## Notifications and emailed reports

After every completed production audit, whether it passes or fails, the workflow
sends an email containing the result, audited URL, workflow link, and a ZIP of
the Lighthouse HTML/JSON reports. If Lighthouse stops before producing files,
the completion email is still sent and directs the recipient to the logs.

Configure these GitHub Actions repository secrets under **Settings → Secrets
and variables → Actions**:

| Secret | Required | Value |
| --- | --- | --- |
| `AUDIT_EMAIL_USERNAME` | Yes | SMTP login/sender email |
| `AUDIT_EMAIL_PASSWORD` | Yes | SMTP password or app password |
| `AUDIT_EMAIL_TO` | Yes | Recipient email |
| `AUDIT_SMTP_SERVER` | No | Defaults to `smtp.gmail.com` |
| `AUDIT_SMTP_PORT` | No | Defaults to `465`; port `587` uses STARTTLS |

For Gmail, use a Google app password rather than the normal Google account
password. The mail step skips safely, with an Actions notice, until all three
required secrets exist.

If the security scan or production audit fails, the workflow additionally opens an issue named **Automated security or production audit failed** and assigns it to the repository owner. Later failures add comments to the same open issue instead of producing duplicates. GitHub sends the owner notifications according to their account settings.

The workflow needs the default `GITHUB_TOKEN` permissions declared in the workflow. CodeQL uploads require code scanning to be available for the repository.

## Recommended repository setting

Create an Actions repository variable named `PRODUCTION_URL` containing the canonical deployment origin, without a trailing slash. Example:

```text
https://zubairdeveloper.com
```

Repository Issues must remain enabled for failure issues. SMTP secrets are
required only for the always-on completion email described above.
