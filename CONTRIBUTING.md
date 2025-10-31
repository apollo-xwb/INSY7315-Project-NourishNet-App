# Contributing

Thanks for contributing to NourishNet This document explains how we work so changes are easy to review and ship.

## Branching
- Create feature branches from `main`: `feat/...`, `fix/...`, `chore/...`, `docs/...`.
- Keep PRs focused and small; link a related issue if available.

## Commit messages
Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only changes
- `chore:` tooling, config, or maintenance
- `refactor:` code change that neither fixes a bug nor adds a feature

Example: `fix: mark picked up sets pickedUpAt timestamp`

Co-authored commits (pairing):
```
Co-authored-by: Full Name <email@example.com>
```

## Code style
- Follow existing formatting.
- Prefer clear names and early returns; avoid deep nesting.
- Keep comments brief and only for non-obvious rationale.

## PR checklist
- [ ] Lints pass locally
- [ ] Tested on web and device (where relevant)
- [ ] Screenshots for UI changes (if helpful)
- [ ] Includes adequate error handling and user feedback

## Running locally
- `npm i`
- `npx expo start` (or `--web`)

## Security & data
- Never commit secrets. Use `.env` and Expo public env for safe keys.
- Mask PII in logs. Remove verbose logs before merging.

## Reviews
- At least 1 reviewer approval required. Address comments or reply with reasoning.

---
Thanks for being a part of the team!

