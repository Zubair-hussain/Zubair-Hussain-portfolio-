# Engineering evidence record

Generated: 2026-09-12T09:54:25.647Z

This directory is a reproducible evidence package created by `npm run records:generate`. It records the state of the working tree at execution time; it is not a cryptographic attestation.

## Snapshot

- Required checks: PASS
- Tests: PASS
- Core coverage: 83.53% statements, 86.74% functions, 87.81% lines, 65.07% branches
- Full-source coverage: 30.64% statements and 31.85% lines
- Dependency license records: 1199; non-MIT/mixed/unknown flags: 371

## Folders

- [logs](logs/README.md): raw lint, type-check, test, coverage, build, and npm-audit output.
- [coverage](coverage/README.md): core gate and full-source coverage evidence.
- [licenses](licenses/license-report.md): complete dependency-license inventory and review flags.
- [memory](memory/memory-report.md): environment and Vitest heap-use evidence.
- [evidence](evidence/README.md): generated SVG summaries suitable for review in GitHub.

## Reproduce

Use the Node version supported by the dependency tree, install with `npm ci`, then run:

```bash
npm run records:generate
```

Do not place environment files, credentials, or application secrets in this folder.
