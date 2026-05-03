import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseIntEnv } from './env.ts';
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
    prNumber: parseIntEnv('PR_NUMBER'),
    baseSha: requireSha('BASE_SHA'),
    headSha: requireSha('HEAD_SHA'),
    repoRoot,
  };
}

function requireSha(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  if (!SHA_RE.test(v)) {
    throw new Error(`Env ${name} must be a 40-char hex SHA, got ${JSON.stringify(v)}`);
  }
  return v;
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

/**
 * Walks a unified diff and returns, per file, the set of RIGHT-side line numbers
 * that GitHub will accept as anchors (additions + context lines that survive in
 * the new file). Comments anchored to lines outside this set get rejected with
 * "Path could not be resolved and Line could not be resolved" — this set lets
 * us drop those before calling the GitHub API.
 */
function parseAddressableLines(diff: string): Map<string, Set<number>> {
  const out = new Map<string, Set<number>>();
  let currentFile: string | null = null;
  let lineNo = 0;
  let inHunk = false;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      currentFile = line.slice('+++ b/'.length);
      if (!out.has(currentFile)) out.set(currentFile, new Set());
      inHunk = false;
      continue;
    }
    if (line.startsWith('--- ') || line.startsWith('diff --git ')) {
      inHunk = false;
      continue;
    }
    const hunkMatch = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (hunkMatch) {
      lineNo = Number(hunkMatch[1]);
      inHunk = true;
      continue;
    }
    if (!inHunk || currentFile === null) continue;
    const first = line[0];
    if (first === '+') {
      out.get(currentFile)!.add(lineNo);
      lineNo++;
    } else if (first === ' ') {
      out.get(currentFile)!.add(lineNo);
      lineNo++;
    } else if (first === '-') {
      // deleted line — does not consume a RIGHT-side line number
    } else if (first === '\\') {
      // "\ No newline at end of file" — skip
    }
  }
  return out;
}

const SHA_RE = /^[0-9a-f]{40}$/i;

/**
 * Returns true if `sha` is a 40-char hex SHA, exists in the local repo, AND
 * is an ancestor of `head`. After force-push or rebase the SHA may be missing
 * or no longer reachable from HEAD; trusting it would break `git diff`. The
 * regex check also blocks crafted strings (e.g. `--upload-pack=...`) that git
 * could otherwise interpret as a flag.
 */
function isAncestor(repoRoot: string, sha: string, head: string): boolean {
  if (!SHA_RE.test(sha) || !SHA_RE.test(head)) return false;
  try {
    execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    execFileSync('git', ['merge-base', '--is-ancestor', sha, head], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
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
  const persistedSha = summary?.state?.sha ?? null;
  const previousSha =
    persistedSha && isAncestor(env.repoRoot, persistedSha, env.headSha) ? persistedSha : null;
  if (persistedSha && !previousSha) {
    console.log(
      `Persisted SHA ${persistedSha.slice(0, 7)} is no longer reachable from HEAD ` +
        `(force-push or rebase?) — falling back to base SHA.`
    );
  }
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

  // Compute the addressable-lines map ONCE from the full diff so each reviewer
  // can validate its post_review_comment anchors at tool-call time and Claude
  // can self-correct via tool errors instead of having comments silently
  // dropped post-orchestrator.
  const fullDiff = gitDiff(env.repoRoot, fromSha, env.headSha, changedFiles);
  const addressableLines = parseAddressableLines(fullDiff);

  const reviewerResults = await Promise.all(
    matched.map(async (m) => {
      const reviewerContext = await buildReviewerContext(env.repoRoot, m.spec);
      const diff = gitDiff(env.repoRoot, fromSha, env.headSha, m.matchedFiles);
      if (diff.length === 0) {
        return {
          reviewerName: m.name,
          comments: [],
          verdict: { event: 'COMMENT' as const, summary: 'No diff to review.' },
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
        addressableLines,
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
      keptFindings = result.keptIndices.flatMap((i) => {
        const f = rawFindings[i];
        if (!f) {
          console.warn(`Orchestrator returned out-of-range index ${i}; skipping.`);
          return [];
        }
        return [f];
      });
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

  // Defense in depth — runReviewer already validates anchors at tool-call
  // time, but if a reviewer ignored the tool error or the orchestrator kept a
  // bogus comment somehow, this stops the bad anchor from tanking the whole
  // batch with a 422 from GitHub's createReview.
  const beforeFilter = keptFindings.length;
  keptFindings = keptFindings.filter((f) => {
    const lines = addressableLines.get(f.path);
    if (!lines || !lines.has(f.line)) {
      console.warn(
        `Dropping comment from ${f.reviewer}: ${f.path}:${f.line} not in diff (ruleId=${f.ruleId})`
      );
      return false;
    }
    return true;
  });
  if (keptFindings.length < beforeFilter) {
    console.log(`Diff-validity filter: kept ${keptFindings.length}/${beforeFilter} findings`);
  }

  // Severity counts must reflect ALL kept findings, not just the new ones.
  // Otherwise dedup-against-existing silently demotes the verdict on re-runs:
  // a high-severity finding posted on an earlier commit would be dedup'd here
  // and stop contributing to totals → final event flips REQUEST_CHANGES → COMMENT
  // even though the issue still stands.
  const totals = emptyCounts();
  const reviewerCountsMap = new Map<string, SeverityCounts>();
  for (const f of keptFindings) {
    let counts = reviewerCountsMap.get(f.reviewer);
    if (!counts) {
      counts = emptyCounts();
      reviewerCountsMap.set(f.reviewer, counts);
    }
    bumpCount(counts, f.severity);
    bumpCount(totals, f.severity);
  }

  const dedupeKeys = dedupeKeysFromExisting(existingReviewComments);
  const aggregated: PostReviewCommentInput[] = [];
  for (const f of keptFindings) {
    const key = commentDedupKey({ path: f.path, line: f.line, ruleId: f.ruleId });
    if (dedupeKeys.has(key)) continue;
    dedupeKeys.add(key);
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
