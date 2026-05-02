# PR Reviewer (Claude API)

Standalone Node package invoked from `.github/workflows/claude-review.yml`. Runs the Claude API to post inline review comments on pull requests, evaluates developer replies, and resolves threads.

Skills are loaded from `.claude/skills/**/SKILL.md` — the same source of truth used by Claude Code locally.

## Local development

```bash
cd scripts/review
pnpm install
ANTHROPIC_API_KEY=sk-... GITHUB_TOKEN=ghp_... \
  REPO=vata-apps/vata-app PR_NUMBER=42 \
  BASE_SHA=abc HEAD_SHA=def \
  pnpm review
```

## Entrypoints

- `index.ts` — full PR review on `pull_request: opened/synchronize`
- `reply.ts` — single reply evaluation on `pull_request_review_comment: created`
