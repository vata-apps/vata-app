import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildPersonaContext, loadPersonaConfig, matchPersonas } from './personas.ts';
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
import { makeAnthropic, runPersonaReview } from './claude.ts';
import type { PostReviewCommentInput, ReviewEvent, Severity } from './tools.ts';

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

  const personaConfig = await loadPersonaConfig(env.repoRoot);
  const matched = matchPersonas(personaConfig, changedFiles);
  console.log(`Personas matched: ${matched.map((p) => p.name).join(', ') || '(none)'}`);

  const newState = {
    sha: env.headSha,
    ts: new Date().toISOString(),
    personas: matched.map((p) => p.name),
  };

  if (matched.length === 0) {
    const body = buildSummaryBody({
      state: newState,
      personaSummaries: [],
      finalEvent: 'COMMENT',
      totals: emptyCounts(),
    });
    await upsertIssueComment(octokit, ctx, {
      body,
      existingId: summary?.commentId ?? null,
    });
    console.log('Done (no matched personas — summary only, no review submitted).');
    return;
  }

  const reviewerPromptPath = join(env.repoRoot, '.github', 'code-review', 'prompts', 'reviewer.md');
  const systemPromptTemplate = await readFile(reviewerPromptPath, 'utf8');

  const personaResults = await Promise.all(
    matched.map(async (m) => {
      const personaContext = await buildPersonaContext(env.repoRoot, m.spec);
      const diff = gitDiff(env.repoRoot, fromSha, env.headSha, m.matchedFiles);
      if (diff.length === 0) {
        return {
          personaName: m.name,
          comments: [],
          verdict: { event: 'APPROVE' as const, summary: 'No diff to review.' },
          iterations: 0,
          truncated: false,
        };
      }
      console.log(
        `[${m.name}] running review (${m.matchedFiles.length} files, ${diff.length} diff chars)`
      );
      return runPersonaReview(anthropic, {
        personaName: m.name,
        personaContext,
        diff,
        changedFiles: m.matchedFiles,
        systemPromptTemplate,
      });
    })
  );

  const dedupeKeys = dedupeKeysFromExisting(existingReviewComments);

  const aggregated: PostReviewCommentInput[] = [];
  const totals = emptyCounts();
  const personaSummaries: Array<{
    persona: string;
    summary: string;
    counts: SeverityCounts;
  }> = [];

  for (const result of personaResults) {
    const personaCounts = emptyCounts();
    for (const c of result.comments) {
      const key = commentDedupKey({
        path: c.path,
        line: c.line,
        ruleId: c.ruleId,
      });
      if (dedupeKeys.has(key)) continue;
      dedupeKeys.add(key);
      bumpCount(personaCounts, c.severity);
      bumpCount(totals, c.severity);
      aggregated.push({
        ...c,
        body: annotateBody(c.body, {
          ruleId: c.ruleId,
          severity: c.severity,
        }),
      });
    }
    personaSummaries.push({
      persona: result.personaName,
      summary:
        result.verdict?.summary ?? '(persona did not return a verdict — capped at max iterations)',
      counts: personaCounts,
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
    personaSummaries.map((p) => `- **${p.persona}**: ${p.summary}`).join('\n');

  await createReview(octokit, ctx, {
    body: reviewBody,
    event: finalEvent,
    comments: aggregated,
    commitSha: env.headSha,
  });

  const summaryBody = buildSummaryBody({
    state: newState,
    personaSummaries,
    finalEvent,
    totals,
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
