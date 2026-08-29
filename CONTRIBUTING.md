# Contributing & Commit Guidelines

This repo uses **Conventional Commits**. The **Commit Test** GitHub Action
([`.github/workflows/commit-test.yml`](.github/workflows/commit-test.yml))
checks every commit message in a pull request, and clean messages feed the
automatic version tags (`v0.1 → v0.2 → …`) created by the **Release Tag** action.

## Format

```
<type>(<optional scope>): <short description>
```

- Use the **imperative mood** ("add", not "added"/"adds").
- Keep the subject **under ~72 characters**, no trailing period.
- Scope is optional and lowercase, e.g. `chat`, `projects`, `seo`, `ci`.
- Add `!` after the type/scope for a breaking change, e.g. `feat!: …`.

### Allowed types

| Type       | Use it for                                                        |
| ---------- | ---------------------------------------------------------------- |
| `feat`     | A new feature                                                    |
| `fix`      | A bug fix                                                        |
| `docs`     | Documentation only                                              |
| `style`    | Formatting / whitespace (no logic change)                       |
| `refactor` | Code change that neither fixes a bug nor adds a feature          |
| `perf`     | Performance improvement                                         |
| `test`     | Adding or updating tests                                        |
| `build`    | Build system, dependencies, bundler                            |
| `ci`       | CI/CD config (GitHub Actions, etc.)                            |
| `chore`    | Maintenance, tooling, housekeeping                             |
| `revert`   | Reverting a previous commit                                     |

## Examples

✅ Good

```
feat: add 3-card projects showcase
feat(chat): stream responses from Cloudflare Workers AI
fix(seo): use CF_PAGES_URL for robots and sitemap
docs: add commit guidelines
refactor(hero): move veil colors into CSS variables
chore: bump next to 16.3.3
feat!: replace red theme with indigo accent
```

❌ Rejected by CI

```
update stuff            # no type
Fixed bug               # not imperative, no type
feat - new section      # wrong separator (use a colon)
WIP                     # not descriptive
```

> Merge commits (`Merge ...`) are ignored by the check.

## How commits become versions

1. Open a PR → **Lint**, **Test**, **Build**, and **Commit Test** must pass.
2. Merge to `main` → **Build** runs again on `main`.
3. On a successful build, **Release Tag** creates the next tag (e.g. `v0.3`)
   and a GitHub Release with auto-generated notes from your commit messages.

So: **write clear conventional commits and your changelog writes itself.**

## Local checks before pushing

```bash
npm run lint         # ESLint
npm run type-check   # TypeScript
npm test             # Vitest
npm run build        # Next.js production build
```

## Tips

- One logical change per commit — it keeps history and release notes readable.
- The commit check only runs on **pull requests**. When pushing directly to
  `main`, still follow the format so release notes stay clean.
