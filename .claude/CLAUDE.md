# CLAUDE.md — Proposal Generator Platform

AI-powered proposal generation SaaS. Users log in, describe a project in 1-2 paragraphs, get a full AI-drafted proposal, share it as a public URL, and collect e-signature + Razorpay payment from the client.

Full design spec: `docs/superpowers/specs/2026-04-07-proposal-generator-design.md`
Implementation plan: `docs/superpowers/plans/wondrous-juggling-planet.md` (stored in Claude plans dir)

---

## Quick Reference

| Topic | File |
|---|---|
| Tech stack | `.claude/rules/stack.md` |
| Project structure | `.claude/rules/project-structure.md` |
| Backend conventions | `.claude/rules/backend-conventions.md` |
| Frontend conventions | `.claude/rules/frontend-conventions.md` |
| Database schema | `.claude/rules/data-model.md` |
| Environment variables | `.claude/rules/environment.md` |

---

## Key Facts

- **Multi-tenant** — each user sees only their own proposals
- **Public proposal pages** — `/p/[token]` requires no auth (client-facing)
- **Proposal status flow** — `draft → published → signed → paid`
- **Payment** — Razorpay (India), single account, INR, one-time
- **AI** — swappable via `AI_PROVIDER=openai|anthropic` in `.env`
- **Signature** — client can type (cursive font) or draw (canvas)
- **Success** — confetti animation after payment at `/p/[token]/success`
- **Platform-independent** — fully Dockerized, deploy anywhere
