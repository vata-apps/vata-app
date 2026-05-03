import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildReviewerContext, loadReviewersConfig, matchReviewers } from './reviewers.ts';
import {
  createReview,
  listIssueComments,
  listReviewComments,
  makeOctokit,
  parseRepo,
  upsertIssueComment,
  type RepoContext,
} from './github.ts';
import {
  annotateBody,
  buildSummaryBody,
  commentDedupKey,
  dedupeKeysFromExisting,
  emptyCounts,
  findExistingSummary,
  type SeverityCounts,
} from './state.ts';
import { makeAnthropic, runOrchestrator, runReviewer } from './claude.ts';
import type { PostReviewCommentInput, ReviewEvent, Severity } from './tools.ts';

const ORCHESTRATOR_MIN_FINDINGS = 2;
const ORCHESTRATOR_MAX_FINDINGS = 50;

interface Env {
  anthropicApiKey: string;
  githubToken: string;
  repo: string;
  prNumber: number;
  baseSha: string;
  headSha: string;
  repoRoot: string;
}

function readEnv(): Env {
  const required = [
    'ANTHROPIC_API_KEY',
    'GITHUB_TOKEN',
    'REPO',
    'PR_NUMBER',
    'BASE_SHA',
    'HEAD_SHA',
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
    baseSha: process.env.BASE_SHA!,
    headSha: process.env.HEAD_SHA!,
    repoRoot,
  };
}

function gitChangedFiles(repoRoot: string, fromSha: string, toSha: string): string[] {
  const out = execFileSync('git', ['diff', '--name-only', `${fromSha}..${toSha}`], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  return out
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function gitDiff(
  repoRoot: string,
  fromSha: string,
  toSha: string,
  files: readonly string[]
): string {
  if (files.length === 0) return '';
  return execFileSync('git', ['diff', '--unified=5', `${fromSha}..${toSha}`, '--', ...files], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

function buildDiffSummary(
  repoRoot: string,
  fromSha: string,
  toSha: string,
  files: readonly string[]
): string {
  if (files.length === 0) return '(no changed files)';
  const stats = execFileSync(
    'git',
    ['diff', '--shortstat', `${fromSha}..${toSha}`, '--', ...files],
    { cwd: repoRoot, encoding: 'utf8' }
  ).trim();
  return [`Changed files (${files.length}):`, ...files.map((f) => `- ${f}`), '', stats].join('\n');
}

function pickFinalEvent(totals: SeverityCounts): ReviewEvent {
  if (totals.critical > 0 || totals.high > 0 || totals.medium > 0) {
    return 'REQUEST_CHANGES';
  }
  return 'COMMENT';
}

function bumpCount(counts: SeverityCounts, severity: Severity): void {
  counts[severity] += 1;
}

async function main(): Promise<void> {
  const env = readEnv();
  const { owner, repo } = parseRepo(env.repo);
  const ctx: RepoContext = { owner, repo, prNumber: env.prNumber };

  const octokit = makeOctokit(env.githubToken);
  const anthropic = makeAnthropic(env.anthropicApiKey);

  console.log(`Reviewing PR #${env.prNumber} (${owner}/${repo})`);

  const [issueComments, existingReviewComments] = await Promise.all([
    listIssueComments(octokit, ctx),
    listReviewComments(octokit, ctx),
  ]);
  const summary = findExistingSummary(issueComments);
  const previousSha = summary?.state?.sha ?? null;
  const fromSha = previousSha ?? env.baseSha;

  console.log(
    `Diff scope: ${fromSha.slice(0, 7)}..${env.headSha.slice(0, 7)} ` +
      `(${previousSha ? 're-review' : 'first review'})`
  );

  const changedFiles = gitChangedFiles(env.repoRoot, fromSha, env.headSha);
  console.log(`Changed files: ${changedFiles.length}`);

  const reviewersConfig = await loadReviewersConfig(env.repoRoot);
  const matched = matchReviewers(reviewersConfig, changedFiles);
  console.log(`Reviewers matched: ${matched.map((r) => r.name).join(', ') || '(none)'}`);

  const newState = {
    sha: env.headSha,
    ts: new Date().toISOString(),
    reviewers: matched.map((r) => r.name),
  };

  if (matched.length === 0) {
    const body = buildSummaryBody({
      state: newState,
      reviewerSummaries: [],
      finalEvent: 'COMMENT',
      totals: emptyCounts(),
    });
    await upsertIssueComment(octokit, ctx, {
      body,
      existingId: summary?.commentId ?? null,
    });
    console.log('Done (no matched reviewers — summary only, no review submitted).');
    return;
  }

  const reviewerPromptPath = join(env.repoRoot, '.github', 'code-review', 'prompts', 'reviewer.md');
  const systemPromptTemplate = await readFile(reviewerPromptPath, 'utf8');

  const reviewerResults = await Promise.all(
    matched.map(async (m) => {
      const reviewerContext = await buildReviewerContext(env.repoRoot, m.spec);
      const diff = gitDiff(env.repoRoot, fromSha, env.headSha, m.matchedFiles);
      if (diff.length === 0) {
        return {
          reviewerName: m.name,
          comments: [],
          verdict: { event: 'APPROVE' as const, summary: 'No diff to review.' },
          iterations: 0,
          truncated: false,
        };
      }
      console.log(
        `[${m.name}] running review (${m.matchedFiles.length} files, ${diff.length} diff chars)`
      );
      return runReviewer(anthropic, {
        reviewerName: m.name,
        reviewerContext,
        diff,
        changedFiles: m.matchedFiles,
        systemPromptTemplate,
      });
    })
  );

  const rawFindings: Array<PostReviewCommentInput & { reviewer: string }> = [];
  const reviewerVerdicts = new Map<string, string>();
  for (const result of reviewerResults) {
    const verdictSummary =
      result.verdict?.summary ?? '(reviewer did not return a verdict — capped at max iterations)';
    reviewerVerdicts.set(result.reviewerName, verdictSummary);
    for (const c of result.comments) {
      rawFindings.push({ ...c, reviewer: result.reviewerName });
    }
  }

  let keptFindings = rawFindings;
  let orchestratorSummary: string | null = null;
  if (
    rawFindings.length >= ORCHESTRATOR_MIN_FINDINGS &&
    rawFindings.length <= ORCHESTRATOR_MAX_FINDINGS
  ) {
    try {
      const orchestratorPromptPath = join(
        env.repoRoot,
        '.github',
        'code-review',
        'prompts',
        'orchestrator.md'
      );
      const orchestratorTemplate = await readFile(orchestratorPromptPath, 'utf8');
      const result = await runOrchestrator(anthropic, {
        systemPromptTemplate: orchestratorTemplate,
        findings: rawFindings.map((f) => ({
          reviewer: f.reviewer,
          path: f.path,
          line: f.line,
          severity: f.severity,
          ruleId: f.ruleId,
          body: f.body,
        })),
        diffSummary: buildDiffSummary(env.repoRoot, fromSha, env.headSha, changedFiles),
      });
      keptFindings = result.keptIndices.map((i) => rawFindings[i]!);
      orchestratorSummary = result.summary;
      console.log(
        `Orchestrator: kept ${keptFindings.length}/${rawFindings.length}, dropped ${result.droppedIndices.length}`
      );
      for (const d of result.droppedIndices) {
        console.log(`  drop[${d.index}] ${d.reason}`);
      }
    } catch (err) {
      console.warn(
        `Orchestrator failed, posting all findings unfiltered: ${(err as Error).message}`
      );
    }
  } else if (rawFindings.length > ORCHESTRATOR_MAX_FINDINGS) {
    console.log(
      `Skipping orchestrator: ${rawFindings.length} findings exceeds cap of ${ORCHESTRATOR_MAX_FINDINGS}`
    );
  }

  const dedupeKeys = dedupeKeysFromExisting(existingReviewComments);
  const aggregated: PostReviewCommentInput[] = [];
  const totals = emptyCounts();
  const reviewerCountsMap = new Map<string, SeverityCounts>();

  for (const f of keptFindings) {
    const key = commentDedupKey({ path: f.path, line: f.line, ruleId: f.ruleId });
    if (dedupeKeys.has(key)) continue;
    dedupeKeys.add(key);
    let counts = reviewerCountsMap.get(f.reviewer);
    if (!counts) {
      counts = emptyCounts();
      reviewerCountsMap.set(f.reviewer, counts);
    }
    bumpCount(counts, f.severity);
    bumpCount(totals, f.severity);
    const { reviewer: _reviewer, ...comment } = f;
    aggregated.push({
      ...comment,
      body: annotateBody(f.body, { ruleId: f.ruleId, severity: f.severity }),
    });
  }

  const reviewerSummaries: Array<{ reviewer: string; summary: string; counts: SeverityCounts }> =
    [];
  for (const [reviewer, summary] of reviewerVerdicts) {
    reviewerSummaries.push({
      reviewer,
      summary,
      counts: reviewerCountsMap.get(reviewer) ?? emptyCounts(),
    });
  }

  const finalEvent = pickFinalEvent(totals);

  console.log(
    `Final event: ${finalEvent} (critical=${totals.critical} high=${totals.high} ` +
      `medium=${totals.medium} low=${totals.low} nit=${totals.nit}, ` +
      `posting ${aggregated.length} new comment(s))`
  );

  const reviewBody =
    `**Claude Review** — ${finalEvent}\n\n` +
    reviewerSummaries.map((r) => `- **${r.reviewer}**: ${r.summary}`).join('\n');

  await createReview(octokit, ctx, {
    body: reviewBody,
    event: finalEvent,
    comments: aggregated,
    commitSha: env.headSha,
  });

  const summaryBody = buildSummaryBody({
    state: newState,
    reviewerSummaries,
    finalEvent,
    totals,
    orchestratorSummary,
  });
  await upsertIssueComment(octokit, ctx, {
    body: summaryBody,
    existingId: summary?.commentId ?? null,
  });

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
