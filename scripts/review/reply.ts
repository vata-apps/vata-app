import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  findReviewThread,
  getReviewComment,
  makeGraphql,
  makeOctokit,
  parseRepo,
  replyToReviewComment,
  resolveReviewThread,
  type RepoContext,
} from './github.ts';
import { BOT_LOGIN, parseAnnotation } from './state.ts';
import { makeAnthropic, runReplyEvaluation } from './claude.ts';

interface Env {
  anthropicApiKey: string;
  githubToken: string;
  repo: string;
  prNumber: number;
  commentId: number;
  repoRoot: string;
}

function readEnv(): Env {
  const required = [
    'ANTHROPIC_API_KEY',
    'GITHUB_TOKEN',
    'REPO',
    'PR_NUMBER',
    'COMMENT_ID',
  ] as const;
  for (const k of required) {
    if (!process.env[k]) throw new Error(`Missing env: ${k}`);
  }
  const repoRoot =
    process.env.REPO_ROOT ??
    execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
    }).trim();
  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
    githubToken: process.env.GITHUB_TOKEN!,
    repo: process.env.REPO!,
    prNumber: Number(process.env.PR_NUMBER!),
    commentId: Number(process.env.COMMENT_ID!),
    repoRoot,
  };
}

async function readCodeContext(
  repoRoot: string,
  path: string,
  line: number,
  windowLines: number = 5
): Promise<string> {
  const fullPath = join(repoRoot, path);
  let raw: string;
  try {
    raw = await readFile(fullPath, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return '(file not found at HEAD — likely deleted)';
    }
    throw err;
  }
  const lines = raw.split('\n');
  const start = Math.max(0, line - 1 - windowLines);
  const end = Math.min(lines.length, line + windowLines);
  return lines
    .slice(start, end)
    .map((l, i) => {
      const ln = start + i + 1;
      const marker = ln === line ? '>' : ' ';
      return `${marker} ${ln.toString().padStart(4)} | ${l}`;
    })
    .join('\n');
}

async function main(): Promise<void> {
  const env = readEnv();
  const { owner, repo } = parseRepo(env.repo);
  const ctx: RepoContext = { owner, repo, prNumber: env.prNumber };

  const octokit = makeOctokit(env.githubToken);
  const gql = makeGraphql(env.githubToken);

  console.log(`Evaluating reply on comment ${env.commentId} (PR #${env.prNumber})`);

  const reply = await getReviewComment(octokit, ctx, env.commentId);
  if (reply.userLogin === BOT_LOGIN) {
    console.log('Reply is from the bot itself — skipping (loop guard).');
    return;
  }
  if (reply.inReplyToId === null) {
    console.log('Comment is top-level (not a reply) — skipping.');
    return;
  }

  const [parent, thread] = await Promise.all([
    getReviewComment(octokit, ctx, reply.inReplyToId),
    findReviewThread(gql, ctx, reply.inReplyToId),
  ]);

  if (parent.userLogin !== BOT_LOGIN) {
    console.log(`Parent comment author is ${parent.userLogin}, not the bot — skipping.`);
    return;
  }
  if (parent.line === null) {
    console.log('Parent comment has no line anchor — skipping.');
    return;
  }
  if (thread === null) {
    console.log('Could not locate review thread for parent comment — skipping.');
    return;
  }
  if (thread.isResolved) {
    console.log('Thread already resolved — skipping.');
    return;
  }

  const { ruleId, severity } = parseAnnotation(parent.body);
  const replyEvaluatorPath = join(
    env.repoRoot,
    '.github',
    'code-review',
    'prompts',
    'reply-evaluator.md'
  );
  const [codeContext, systemPromptTemplate] = await Promise.all([
    readCodeContext(env.repoRoot, parent.path, parent.line),
    readFile(replyEvaluatorPath, 'utf8'),
  ]);

  const anthropic = makeAnthropic(env.anthropicApiKey);
  const decision = await runReplyEvaluation(anthropic, {
    systemPromptTemplate,
    originalCommentBody: parent.body,
    ruleId,
    severity,
    codeContext,
    devReplyBody: reply.body,
  });

  if (decision === null) {
    console.log('Claude did not return a decision — skipping.');
    return;
  }

  console.log(`Decision: ${decision.decision} — ${decision.reasoning}`);

  switch (decision.decision) {
    case 'RESOLVED':
      await resolveReviewThread(gql, thread.threadId);
      console.log('Thread resolved.');
      break;
    case 'PUSHBACK':
      if (!decision.replyBody) {
        console.log('PUSHBACK without replyBody — skipping reply.');
        return;
      }
      await replyToReviewComment(octokit, ctx, {
        commentId: parent.id,
        body: decision.replyBody,
      });
      console.log('Pushback reply posted.');
      break;
    case 'ACKNOWLEDGE':
      console.log('Acknowledged — no action.');
      break;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
