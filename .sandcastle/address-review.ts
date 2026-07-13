import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createWorktree, opencode } from '@ai-hero/sandcastle';
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox';
import {
  extractTag,
  logUsage,
  MODEL_DEFAULT,
  MODEL_ESCALATE,
  required,
  verify,
  writeGithubOutput,
} from './shared';

// Entry point for the review → commits flow, invoked by
// .github/workflows/agent-address-review.yml.
// See docs/adr/0009-agent-review-feedback.md.

interface LineComment {
  id: number;
  path: string;
  line: number | null;
  body: string;
  diffHunk: string;
}

const issueNumber = required('ISSUE_NUMBER');
const reviewDataPath = process.env.REVIEW_DATA_PATH ?? '/tmp/review-context.json';

if (!existsSync(reviewDataPath)) {
  console.error(`Review data file not found at ${reviewDataPath}`);
  process.exit(1);
}

const review = JSON.parse(readFileSync(reviewDataPath, 'utf-8')) as {
  prNumber: number;
  reviewBody: string;
  lineComments: LineComment[];
  issue: { number: number; title: string; body: string };
};

const escalate = process.env.ESCALATE === 'true';
const model = escalate ? MODEL_ESCALATE : MODEL_DEFAULT;
const branch = `agent/issue-${issueNumber}`;

console.log(`PR: #${review.prNumber} — addressing review on ${branch}`);
console.log(`Model: ${model}`);
console.log(`Line comments: ${review.lineComments.length}`);

const wt = await createWorktree({
  branchStrategy: { type: 'branch', branch },
});

const result = await wt.run({
  agent: opencode(model),
  sandbox: noSandbox(),
  promptFile: '.sandcastle/prompts/address-review.md',
  promptArgs: {
    PR_NUMBER: String(review.prNumber),
    ISSUE_NUMBER: String(review.issue.number),
    ISSUE_TITLE: review.issue.title,
    ISSUE_BODY: review.issue.body,
    REVIEW_BODY: review.reviewBody || '(no summary text)',
    LINE_COMMENTS: formatLineComments(review.lineComments),
  },
  hooks: {
    sandbox: {
      onSandboxReady: [{ command: 'pnpm install --frozen-lockfile' }],
    },
  },
  maxIterations: 5,
  idleTimeoutSeconds: 600,
  name: `review-${review.prNumber}`,
  logging: { type: 'stdout' },
});

const completed = result.completionSignal !== undefined;
const commits = result.commits.length;

console.log(`\nIterations: ${result.iterations.length}`);
console.log(`Commits: ${commits}`);
console.log(`Completion signal: ${completed ? 'yes' : 'no'}`);

// has_replies is true only when the block parses as a JSON array — the
// workflow posts replies by iterating it, so a malformed block is no replies.
const replies = extractTag(result.stdout, 'review-replies');
const hasReplies = replies !== null && isJsonArray(replies);
if (hasReplies) {
  writeFileToEnvPath('REVIEW_REPLIES_PATH', replies);
} else if (replies !== null) {
  console.log('<review-replies> block is not a JSON array — ignoring');
} else {
  console.log('No <review-replies> block found in agent output');
}

const summary = extractTag(result.stdout, 'review-summary');
if (summary) {
  writeFileToEnvPath('REVIEW_SUMMARY_PATH', summary);
} else {
  console.log('No <review-summary> block found in agent output');
}

// 0 commits is a legitimate "all skipped" outcome — nothing to verify.
const verifyPassed = commits > 0 ? verify(wt.worktreePath) : true;

logUsage(model, result.iterations);

writeGithubOutput({
  branch: result.branch,
  iterations: String(result.iterations.length),
  commits: String(commits),
  completed: String(completed),
  verify_passed: String(verifyPassed),
  has_replies: String(hasReplies),
  model,
});

function formatLineComments(comments: LineComment[]): string {
  if (comments.length === 0) return '(no line comments)';
  return comments
    .map((c) => {
      const location = c.line ? `${c.path}:${c.line}` : c.path;
      return `### Comment [id ${c.id}] — \`${location}\`\n\n\`\`\`diff\n${c.diffHunk}\n\`\`\`\n\n${c.body}`;
    })
    .join('\n\n');
}

function isJsonArray(text: string): boolean {
  try {
    return Array.isArray(JSON.parse(text));
  } catch {
    return false;
  }
}

function writeFileToEnvPath(envName: string, content: string): void {
  const path = process.env[envName];
  if (!path) return;
  writeFileSync(path, `${content}\n`);
  console.log(`Wrote ${envName} → ${path}`);
}
