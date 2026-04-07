# Git Conventions

## Commit Message Format

Use Conventional Commits:

```
<type>(<scope>): <short description>
```

### Types
| Type | When |
|---|---|
| `feat` | New feature or endpoint |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `refactor` | Code change that's not a fix or feature |
| `chore` | Build, CI, dependencies, config |
| `style` | Formatting only (no logic change) |

### Scopes
`frontend`, `backend`, `db`, `ci`, `infra`, `auth`, `ai`, `payments`

### Examples
```
feat(backend): add Razorpay webhook handler
fix(frontend): correct auth redirect on session expiry
feat(db): add RLS policy for public proposal reads
test(backend): add tests for signature endpoint
chore(ci): add GHCR push step to GitHub Actions
```

## Branch Naming
```
feat/<short-description>
fix/<short-description>
chore/<short-description>
```

Examples: `feat/proposal-editor`, `fix/razorpay-webhook`, `chore/docker-setup`

## Rules
- Commit after every task — small, focused commits
- Never commit `.env` files (covered by `.gitignore`)
- Always commit migration files alongside the code that uses them
- `main` branch is always deployable
