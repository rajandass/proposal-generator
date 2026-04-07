# Proposal Generator

AI-powered proposal SaaS. Users log in → describe a project → AI drafts a full proposal → client gets a public URL → signs + pays via Razorpay.

- Repo: https://github.com/rajandass/proposal-generator
- Design spec: @docs/superpowers/specs/2026-04-07-proposal-generator-design.md

## Key Facts

- **Multi-tenant** — each user sees only their own proposals
- **Proposal status flow** — `draft → published → signed → paid`
- **Public pages** — `/p/[token]` requires no auth (client-facing)
- **AI** — swappable via `AI_PROVIDER=openai|anthropic` in `.env`
- **Payment** — Razorpay (India), INR, one-time, single account
- **Signature** — client types (cursive font) or draws (canvas)
- **Success** — confetti animation at `/p/[token]/success` after payment

## Rules

@.claude/rules/stack.md
@.claude/rules/project-structure.md
@.claude/rules/backend-conventions.md
@.claude/rules/frontend-conventions.md
@.claude/rules/data-model.md
@.claude/rules/environment.md
