---
allowed-tools: Bash(git checkout --branch:*), Bash(git add:*), Bash(git status:*), Bash(git push:*), Bash(git commit:*), Bash(gh pr create:*)
description: Commit, push, and open a PR (draft by default for this repo)
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

## Your task

Based on the above changes:

1. Create a new branch if on main
2. Create a single commit with an appropriate message
3. Push the branch to origin
4. Create a pull request using `gh pr create --draft`. **The `--draft` flag is required.**

   This repo opens every PR as draft so CodeRabbit's automatic review fires only after the local `/review` gate has run. The `shepherd-pr` skill takes it from here — it executes `/review`, addresses real findings, marks the PR ready (`gh pr ready <N>`), then watches CI and CodeRabbit until approval.

5. You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
