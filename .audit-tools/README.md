# Local security-audit toolkit

This directory is the project-local entry point for Cloudflare's
[`security-audit-skill`](https://github.com/cloudflare/security-audit-skill).
The upstream checkout is intentionally ignored by Git so Cloudflare remains
the source of truth and a nested third-party repository is never committed.

## Bootstrap or update

Run from the portfolio repository root:

```bash
git clone --depth 1 https://github.com/cloudflare/security-audit-skill.git .audit-tools/security-audit-skill
```

Update an existing checkout:

```bash
git -C .audit-tools/security-audit-skill pull --ff-only
```

Optional Skills CLI installation:

```bash
npx skills add https://github.com/cloudflare/security-audit-skill \
  --skill security-audit
```

The main instructions and validators are then located under:

```text
.audit-tools/security-audit-skill/skills/security-audit/SKILL.md
.audit-tools/security-audit-skill/skills/security-audit/report-schema.json
.audit-tools/security-audit-skill/skills/security-audit/validate-findings.cjs
.audit-tools/security-audit-skill/skills/security-audit/validate-coverage-ledger.cjs
```

## Required execution policy

Use a POSIX audit host or container that provides every control required by
the skill: no external network for target code, an empty allowlisted
environment, read-only target and toolchain mounts, scratch-only writes,
explicit resource and time limits, and descriptor-confined no-follow artifact
promotion.

Do not probe the deployed portfolio, Firebase, EmailJS, GitHub, Blogger, or
Cloudflare accounts. Provider facts absent from source belong in
`needs_validation` with a safe owner-observed check.

## Expected run output

Keep output outside the target repository unless an ignored directory was
explicitly selected:

```text
run-metadata.json
architecture.md
coverage-ledger.json
findings.json
REPORT.md
FINDINGS-DETAIL.md
NEEDS-VALIDATION.md
agents/<agent-id>/scratch/
agents/<agent-id>/artifacts/
```

## Validate a completed run

On a compatible POSIX host:

```bash
SKILL_DIR=.audit-tools/security-audit-skill/skills/security-audit
RUN_DIR=/absolute/path/to/security-audit-output/zubair-hussain-portfolio/run-N

node "$SKILL_DIR/validate-findings.cjs" "$RUN_DIR/findings.json"
node "$SKILL_DIR/validate-coverage-ledger.cjs" "$RUN_DIR/coverage-ledger.json"
```

Both validators must pass before claiming a completed structured audit.
Validator success proves format and ledger consistency, not vulnerability
impact. The current human-readable report is
[`docs/cloudflare-security-audit-2026-09-25.md`](../docs/cloudflare-security-audit-2026-09-25.md).
