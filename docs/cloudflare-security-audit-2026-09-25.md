# Cloudflare security-audit-skill report — 2026-09-25

## Audit tool setup and reproduction

This review used Cloudflare's official
[`security-audit-skill`](https://github.com/cloudflare/security-audit-skill).
The project-local [audit toolkit guide](../.audit-tools/README.md) documents the
upstream checkout, required sandbox, artifact layout, and validators.

```bash
git clone --depth 1 https://github.com/cloudflare/security-audit-skill.git .audit-tools/security-audit-skill
```

Optional Skills CLI installation:

```bash
npx skills add https://github.com/cloudflare/security-audit-skill \
  --skill security-audit
```

The upstream checkout is Git-ignored. Record its commit in each audit's
`run-metadata.json`. On a compatible POSIX host, validate completed artifacts:

```bash
SKILL_DIR=.audit-tools/security-audit-skill/skills/security-audit
RUN_DIR=/absolute/path/to/security-audit-output/zubair-hussain-portfolio/run-N
node "$SKILL_DIR/validate-findings.cjs" "$RUN_DIR/findings.json"
node "$SKILL_DIR/validate-coverage-ledger.cjs" "$RUN_DIR/coverage-ledger.json"
```

## Status

This is an **incomplete standard-profile source audit** of commit
`c74a70e940e2d9e1c1fec5237bdfbf0d2f6d777f` plus the dirty static-blog
worktree. Three independent reconnaissance reviews completed. The remaining
hunter, coverage-critic, and independent verifier stages could not run after
the audit-agent service reached its usage limit.

Cloudflare's local JSON validators were also attempted, but intentionally
refused this Windows host because OS no-follow and nonblocking input protection
was unavailable. Consequently, this document makes no clean-coverage claim and
does not label any unresolved lead as a confirmed vulnerability.

## Architecture reviewed

- Next.js 16 and React 19 deployed through OpenNext to Cloudflare Workers.
- Static Blogger snapshot feeding homepage cards, archive, article routes, and sitemap.
- Dynamic chat, timeline, email verification, contact, scheduling, and Firebase-config APIs.
- Workers AI, Firebase Auth/Firestore, EmailJS, Turnstile, Blogger, and GitHub Actions boundaries.
- Firestore rules, CSP/security headers, CI/CD workflows, secrets, and deployment configuration.

## Security posture

Strong patterns include server-enforced Firestore moderation, exact testimonial
field allowlisting, static blog routes, bounded AI prompt inputs, React text
escaping, fixed DNS resolver usage with timeouts, and broad baseline security
headers. The largest risks requiring further independent validation concern
CI revision trust, HTML sanitization, public quota consumption, and abuse
controls around public mutation/messaging features.

## Confirmed findings

None. No candidate completed both independent candidate validation and final
record verification.

## Source-grounded leads awaiting independent validation

### 1. Privileged GitHub workflow revision trust

- Source: `.github/workflows/build.yml`, `.github/workflows/security-audit.yml`.
- Boundary: a triggering workflow revision into a job with issue,
  security-event, and SMTP capabilities.
- Remediation applied: the security workflow now follows only successful
  `Deploy to Cloudflare` runs and checkout no longer persists credentials.
- Remaining owner check: verify branch protection, environment approval, and
  Cloudflare/SMTP token scope in GitHub settings.

### 2. Blogger HTML rendered on the portfolio origin

- Source: `src/lib/blog.ts`, `scripts/generate-blog-data-entry.ts`,
  `src/app/blog/[slug]/page.tsx`.
- Boundary: Blogger editor content is sanitized and emitted through
  `dangerouslySetInnerHTML`.
- Concern: the current sanitizer is a regex blocklist rather than a strict
  element/attribute/protocol allowlist.
- Safe validation: use an isolated local browser with fixtures covering SVG,
  MathML, iframe, CSS, malformed markup, data/blob URLs, and unquoted URLs.
- Recommended fix: adopt a maintained allowlist sanitizer at build time and
  retain regression fixtures.

### 3. Public cost-bearing APIs

- Source: `src/app/api/chat/route.ts`,
  `src/app/api/suggest-timeline/route.ts`, and
  `src/app/api/verify-email/route.ts`.
- Boundary: anonymous requests consume Workers AI or DNS work.
- Existing controls: prompt fields are capped and DNS calls have timeouts.
- Missing source fact: distributed Cloudflare WAF/rate-limit and AI budget policy.
- Owner check: verify WAF rules, quota alerts, and per-route analytics without
  generating audit traffic.

### 4. Hire-form anti-abuse

- Original source: a Cloudflare always-pass Turnstile test key gated a direct
  browser EmailJS call.
- Remediation applied: the browser now submits to `/api/contact`; the route
  validates bounded fields, verifies Turnstile server-side, and sends to
  EmailJS only after successful verification. Missing configuration fails closed.
- Required deployment variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
  `TURNSTILE_SECRET_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and
  `EMAILJS_PUBLIC_KEY`.

### 5. Anonymous testimonial creation

- Source: `src/components/sections/Testimonials.tsx`, `firestore.rules`.
- Boundary: anonymous users can create schema-constrained, unapproved records.
- Strong control: only a verified exact admin email can approve/update/delete.
- Missing deployment fact: Firebase App Check and quota policy.
- Recommendation: enable App Check, enforce request-time timestamps, and
  monitor submission rate.

### 6. Contact personal data logging

- Original source: `/api/contact` logged the complete validated submission.
- Remediation applied: full-body logging was removed and every field now has a
  maximum length.

### 7. Schedule redirect configuration

- Source: `src/app/api/schedule/route.ts`.
- Remediation applied: environment overrides must now use HTTPS on
  `calendly.com` or a subdomain; invalid values fall back to the profile URL.
- Note: the schedule JWT remains tracking-only and must not be treated as an
  identity credential by downstream systems.

## Hardening backlog

1. Replace the Blogger regex sanitizer with a maintained strict allowlist.
2. Add source-level or Cloudflare-native distributed limits to AI/DNS routes.
3. Enable Firebase App Check and validate deployed Firestore rules.
4. Pin GitHub Actions to immutable commit SHAs.
5. Scope deployment secrets to the narrowest workflow steps.
6. Remove CSP `unsafe-eval` if production dependency testing permits it.
7. Add an exact Node/package-manager declaration.
8. Resume the Cloudflare audit from its ledger on a POSIX host with fresh
   independent agent capacity.

## Coverage summary

| State | Count |
|---|---:|
| Covered | 0 |
| Candidate | 0 |
| Blocked | 0 |
| Deferred | 10 |
| Confirmed findings | 0 |

The full run artifacts—including architecture, deterministic ledger, empty
validated-record set, detailed unresolved handoff, and run metadata—are stored
outside the application repository under
`security-audit-output/zubair-hussain-portfolio/run-1/` in the shared workspace.

## Resume procedure

1. Use a POSIX host satisfying every sandbox and file-safety requirement.
2. Clone the target and record its exact source revision and dirty state.
3. Load run 1 metadata, architecture, ledger, and findings as prior input.
4. Revalidate changed source rather than assuming reconnaissance is current.
5. Assign every deferred ledger unit to isolated hunters.
6. Run the required post-wave and final-clean coverage critics.
7. Independently validate each surviving candidate.
8. Run both validators after writing findings and updating the ledger.
9. Use fresh final-record verifiers before regenerating prose reports.
10. Mark the new run complete only when both validators pass and every
    candidate has an independent final disposition.
