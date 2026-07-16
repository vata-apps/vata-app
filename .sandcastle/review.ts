import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { claudeCode, createWorktree, type WorktreeRunResult } from '@ai-hero/sandcastle';
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox';
import {
  buildFinalFindings,
  decideReviewOutcome,
  extractSection,
  extractTag,
  hasFixesToApply,
  hasFlaggedFindings,
  logUsage,
  MODEL_OPUS,
  MODEL_SONNET,
  parseFixOutcomes,
  required,
  verify,
  writeGithubOutput,
} from './shared';

// Entry point for the autonomous reviewer, invoked by
// .github/workflows/agent-review.yml.
// See docs/adr/0016-autonomous-pr-review.md.
//
// Two stages on the same worktree: Opus analyzes the diff and decides what to
// fix (read-only), then Sonnet implements exactly what Opus specified without
// re-judging it. Opus costs several times more per token than Sonnet, so
// keeping the token-heavy edit/verify loop on Sonnet cuts review cost while
// keeping Opus's judgment on what to fix. Stage 2 is skipped entirely when
// there is nothing to fix.
//
// Runs on every PR, not just agent-authored ones — the branch to review is
// always the PR's actual head ref, never derived from the issue number. An
// issue is only in the picture when one is linked (agent branches via naming
// convention, human ones via "Closes #N"); either way it's optional context,
// not a requirement.

const issueNumber = process.env.ISSUE_NUMBER || undefined;
const prNumber = required('PR_NUMBER');
const branch = required('BRANCH');
const issueDataPath = process.env.ISSUE_DATA_PATH ?? '/tmp/issue.json';

if (issueNumber && !existsSync(issueDataPath)) {
  console.error(
    `Issue #${issueNumber} was resolved but its data file is missing at ${issueDataPath}`
  );
  process.exit(1);
}

const issue = issueNumber
  ? (JSON.parse(readFileSync(issueDataPath, 'utf-8')) as {
      title: string;
      body: string;
      url: string;
    })
  : undefined;

console.log(`PR: #${prNumber} — reviewing ${branch}`);
console.log(issue ? `Issue: #${issueNumber} — ${issue.title}` : 'Issue: none linked');

const wt = await createWorktree({
  branchStrategy: { type: 'branch', branch },
});

const issueContext = issue
  ? `Implements GitHub issue **#${issueNumber}**.\n\n## Original issue (the spec)\n\n**${issue.title}**\n\n${issue.url}\n\n${issue.body}`
  : 'No issue is linked to this PR — review it against `CLAUDE.md` conventions and general correctness only.';

const promptArgs = {
  PR_NUMBER: prNumber,
  ISSUE_CONTEXT: issueContext,
};

let error = false;
let analysis: WorktreeRunResult | undefined;
let fix: WorktreeRunResult | undefined;
let hadFixesToApply = false;

try {
  // No install hook here: analysis is read-only (no pnpm verify, no build),
  // so it has no use for node_modules. Only the fix stage runs pnpm verify,
  // and it's skipped whenever there's nothing to fix — installing
  // unconditionally would pay that cost even on a clean review.
  analysis = await wt.run({
    agent: claudeCode(MODEL_OPUS),
    sandbox: noSandbox(),
    promptFile: '.sandcastle/prompts/review-analyze.md',
    promptArgs,
    maxIterations: 5,
    idleTimeoutSeconds: 600,
    name: `review-analyze-${prNumber}`,
    logging: { type: 'stdout' },
  });

  const fixesToApply = extractTag(analysis.stdout, 'fixes-to-apply');
  hadFixesToApply = hasFixesToApply(fixesToApply);

  if (hadFixesToApply) {
    fix = await wt.run({
      agent: claudeCode(MODEL_SONNET),
      sandbox: noSandbox(),
      promptFile: '.sandcastle/prompts/review-fix.md',
      promptArgs: {
        ...promptArgs,
        FIXES_TO_APPLY: fixesToApply ?? '',
      },
      hooks: {
        sandbox: {
          onSandboxReady: [{ command: 'pnpm install --frozen-lockfile' }],
        },
      },
      maxIterations: 5,
      idleTimeoutSeconds: 600,
      name: `review-fix-${prNumber}`,
      logging: { type: 'stdout' },
    });
  }
} catch (_err) {
  console.error('Reviewer run failed:', _err);
  error = true;
}

// Stage 2's completion signal and branch are authoritative when it ran;
// otherwise fall back to stage 1 (nothing was found to fix, or the run
// errored before stage 2).
const finalRun = !error ? (fix ?? analysis) : undefined;
const iterations = [...(analysis?.iterations ?? []), ...(fix?.iterations ?? [])];
const completed = finalRun?.completionSignal !== undefined;
const commits = fix?.commits.length ?? 0;

console.log(`\nAnalysis iterations: ${analysis?.iterations.length ?? 0}`);
console.log(`Fix iterations: ${fix?.iterations.length ?? 0}`);
console.log(`Commits: ${commits}`);
console.log(`Completion signal: ${completed ? 'yes' : 'no'}`);

// The final report is assembled deterministically, not re-transcribed by an
// agent: the analysis's own Summary/Flagged text is kept verbatim, and the
// fix stage only reports a compact per-fix outcome (applied or not) rather
// than being trusted to faithfully reproduce the whole document.
const analysisFindings = analysis ? extractTag(analysis.stdout, 'review-findings') : null;
const findings =
  !error && analysisFindings
    ? buildFinalFindings({
        summary: extractSection(analysisFindings, 'Summary') ?? '',
        flagged: extractSection(analysisFindings, 'Flagged for maintainer') ?? 'None',
        outcomes: fix ? parseFixOutcomes(extractTag(fix.stdout, 'fixes-applied')) : [],
      })
    : null;

if (findings) {
  const findingsPath = process.env.REVIEW_FINDINGS_PATH;
  if (findingsPath) {
    writeFileSync(findingsPath, `${findings}\n`);
    console.log(`Review findings written to ${findingsPath}`);
  }
} else {
  console.log('No review findings to report (analysis produced none, or the run errored)');
}

const verifyPassed = commits > 0 && !error ? verify(wt.worktreePath) : false;
const flagged = hasFlaggedFindings(findings);

logUsage(MODEL_OPUS, analysis?.iterations ?? []);
if (fix) {
  logUsage(MODEL_SONNET, fix.iterations);
}

const decision = decideReviewOutcome({
  error,
  commits,
  completed,
  verifyPassed,
  hasFlaggedFindings: flagged,
  hadFixesToApply,
});

writeGithubOutput({
  branch: fix?.branch ?? analysis?.branch ?? branch,
  iterations: String(iterations.length),
  commits: String(commits),
  completed: String(completed),
  verify_passed: String(verifyPassed),
  outcome: decision.outcome,
  push: String(decision.push),
  model: fix ? `${MODEL_OPUS}+${MODEL_SONNET}` : MODEL_OPUS,
});

if (decision.outcome === 'failed') {
  process.exitCode = 1;
}
