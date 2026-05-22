import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { claudeCode, createWorktree } from '@ai-hero/sandcastle';
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox';

const MODEL_OPUS = 'claude-opus-4-7';
const MODEL_SONNET = 'claude-sonnet-4-6';

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

const useOpus = process.env.USE_OPUS === 'true';
const model = useOpus ? MODEL_OPUS : MODEL_SONNET;
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

writeGithubOutput({
  branch: result.branch,
  iterations: String(result.iterations.length),
  commits: String(commits),
  completed: String(completed),
  verify_passed: String(verifyPassed),
  model,
});

function verify(cwd: string): boolean {
  console.log('\nVerifying branch quality...');
  try {
    execSync('pnpm verify', { cwd, stdio: 'inherit' });
    console.log('Verify: passed');
    return true;
  } catch {
    console.log('Verify: failed');
    return false;
  }
}

function extractTag(text: string, tag: string): string | null {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : null;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} env var is required`);
    process.exit(1);
  }
  return value;
}

function writeGithubOutput(outputs: Record<string, string>) {
  const path = process.env.GITHUB_OUTPUT;
  if (!path) return;
  const lines = Object.entries(outputs)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  writeFileSync(path, `${lines}\n`, { flag: 'a' });
}
