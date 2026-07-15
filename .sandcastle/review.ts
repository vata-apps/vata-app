import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createWorktree, opencode, type WorktreeRunResult } from '@ai-hero/sandcastle';
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox';
import {
  decideReviewOutcome,
  extractTag,
  logUsage,
  MODEL_DEFAULT,
  MODEL_ESCALATE,
  required,
  verify,
  writeGithubOutput,
} from './shared';

// Entry point for the autonomous reviewer, invoked by
// .github/workflows/agent-review.yml.
// See docs/adr/0016-autonomous-pr-review.md.

const issueNumber = required('ISSUE_NUMBER');
const prNumber = required('PR_NUMBER');
const issueDataPath = process.env.ISSUE_DATA_PATH ?? '/tmp/issue.json';

if (!existsSync(issueDataPath)) {
  console.error(`Issue data file not found at ${issueDataPath}`);
  process.exit(1);
}

const issue = JSON.parse(readFileSync(issueDataPath, 'utf-8')) as {
  title: string;
  body: string;
  url: string;
};

const escalate = process.env.ESCALATE === 'true';
const model = escalate ? MODEL_ESCALATE : MODEL_DEFAULT;
const branch = `agent/issue-${issueNumber}`;

console.log(`PR: #${prNumber} — reviewing ${branch}`);
console.log(`Issue: #${issueNumber} — ${issue.title}`);
console.log(`Model: ${model}`);

const wt = await createWorktree({
  branchStrategy: { type: 'branch', branch },
});

let error = false;
let result: WorktreeRunResult | undefined;

try {
  result = await wt.run({
    agent: opencode(model),
    sandbox: noSandbox(),
    promptFile: '.sandcastle/prompts/review.md',
    promptArgs: {
      ISSUE_NUMBER: issueNumber,
      ISSUE_TITLE: issue.title,
      ISSUE_BODY: issue.body,
      ISSUE_URL: issue.url,
      PR_NUMBER: prNumber,
    },
    hooks: {
      sandbox: {
        onSandboxReady: [{ command: 'pnpm install --frozen-lockfile' }],
      },
    },
    maxIterations: 5,
    idleTimeoutSeconds: 600,
    name: `review-${prNumber}`,
    logging: { type: 'stdout' },
  });
} catch (_err) {
  console.error('Reviewer run failed:', _err);
  error = true;
}

const iterations = error || !result ? [] : result.iterations;
const completed = error || !result ? false : result.completionSignal !== undefined;
const commits = error || !result ? 0 : result.commits.length;
const stdout = error || !result ? '' : result.stdout;

console.log(`\nIterations: ${iterations.length}`);
console.log(`Commits: ${commits}`);
console.log(`Completion signal: ${completed ? 'yes' : 'no'}`);

const findings = extractTag(stdout, 'review-findings');
if (findings) {
  const findingsPath = process.env.REVIEW_FINDINGS_PATH;
  if (findingsPath) {
    writeFileSync(findingsPath, `${findings}\n`);
    console.log(`Review findings written to ${findingsPath}`);
  }
} else {
  console.log('No <review-findings> block found in agent output');
}

const verifyPassed = commits > 0 && !error ? verify(wt.worktreePath) : false;

logUsage(model, iterations);

const decision = decideReviewOutcome({ error, commits, completed, verifyPassed });

writeGithubOutput({
  branch: result?.branch ?? branch,
  iterations: String(iterations.length),
  commits: String(commits),
  completed: String(completed),
  verify_passed: String(verifyPassed),
  outcome: decision.outcome,
  push: String(decision.push),
  model,
});

if (decision.outcome === 'failed') {
  process.exitCode = 1;
}
