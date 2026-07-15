import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { claudeCode, createWorktree } from '@ai-hero/sandcastle';
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox';
import { extractTag, logUsage, MODEL_SONNET, required, verify, writeGithubOutput } from './shared';

// Entry point for the issue → PR flow, invoked by .github/workflows/agent-run.yml.
// See docs/adr/0008-autonomous-agent-execution.md.

const issueNumber = required('ISSUE_NUMBER');
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

const model = MODEL_SONNET;
const branch = `agent/issue-${issueNumber}`;

console.log(`Issue: #${issueNumber} — ${issue.title}`);
console.log(`Model: ${model}`);
console.log(`Branch: ${branch}`);

const wt = await createWorktree({
  branchStrategy: { type: 'branch', branch },
});

const result = await wt.run({
  agent: claudeCode(model),
  sandbox: noSandbox(),
  promptFile: '.sandcastle/prompts/default.md',
  promptArgs: {
    ISSUE_NUMBER: issueNumber,
    ISSUE_TITLE: issue.title,
    ISSUE_BODY: issue.body,
    ISSUE_URL: issue.url,
  },
  hooks: {
    sandbox: {
      onSandboxReady: [{ command: 'pnpm install --frozen-lockfile' }],
    },
  },
  maxIterations: 5,
  idleTimeoutSeconds: 600,
  name: `issue-${issueNumber}`,
  logging: { type: 'stdout' },
});

const completed = result.completionSignal !== undefined;
const commits = result.commits.length;

console.log(`\nIterations: ${result.iterations.length}`);
console.log(`Commits: ${commits}`);
console.log(`Completion signal: ${completed ? 'yes' : 'no'}`);

const prTitleRaw = extractTag(result.stdout, 'pr-title');
const prTitle = prTitleRaw
  ?.split('\n')
  .map((l) => l.trim())
  .find((l) => l.length > 0);
if (prTitle) {
  const prTitlePath = process.env.PR_TITLE_PATH;
  if (prTitlePath) {
    writeFileSync(prTitlePath, prTitle);
    console.log(`PR title written to ${prTitlePath}: ${prTitle}`);
  }
} else {
  console.log('No <pr-title> block found in agent output — falling back to issue title');
}

const prDescription = extractTag(result.stdout, 'pr-description');
if (prDescription) {
  const prBodyPath = process.env.PR_BODY_PATH;
  if (prBodyPath) {
    writeFileSync(prBodyPath, `${prDescription}\n`);
    console.log(`PR description written to ${prBodyPath}`);
  }
} else {
  console.log('No <pr-description> block found in agent output');
}

const verifyPassed = commits > 0 ? verify(wt.worktreePath) : false;

logUsage(model, result.iterations);

writeGithubOutput({
  branch: result.branch,
  iterations: String(result.iterations.length),
  commits: String(commits),
  completed: String(completed),
  verify_passed: String(verifyPassed),
  model,
});
