import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import type { IterationResult } from '@ai-hero/sandcastle';

// Helpers and constants shared by the sandcastle entry points
// (run.ts, review.ts).

export const MODEL_DEFAULT = 'opencode-go/kimi-k2.7-code';
export const MODEL_ESCALATE = 'opencode-go/qwen3.7-max';

export function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} env var is required`);
    process.exit(1);
  }
  return value;
}

export function writeGithubOutput(outputs: Record<string, string>): void {
  const path = process.env.GITHUB_OUTPUT;
  if (!path) return;
  const lines = Object.entries(outputs)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  writeFileSync(path, `${lines}\n`, { flag: 'a' });
}

export function extractTag(text: string, tag: string): string | null {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : null;
}

export function logUsage(model: string, iterations: readonly IterationResult[]): void {
  console.log('\nRun usage');
  console.log(`  Model:      ${model}`);
  console.log(`  Iterations: ${iterations.length}`);
}

export function verify(cwd: string): boolean {
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

export type ReviewOutcome = 'fixed' | 'clean' | 'flagged' | 'failed';

export interface ReviewDecision {
  outcome: ReviewOutcome;
  push: boolean;
  headerCategory: ReviewOutcome;
}

/**
 * Decide what to do after a reviewer run.
 *
 * This is the single testable seam for the review outcome. It takes only the
 * run facts and returns the outcome classification, whether to push, and the
 * comment header category.
 *
 * Outcome table:
 * | Case                                                      | Outcome  | Push |
 * |-----------------------------------------------------------|----------|------|
 * | Defects found + fixed, verify green                       | fixed    | yes  |
 * | Nothing to fix                                            | clean    | no   |
 * | Defects found but verify red, or iterations exhausted     | flagged  | no   |
 * | Run errored                                               | failed   | no   |
 */
export function decideReviewOutcome(input: {
  error: boolean;
  commits: number;
  completed: boolean;
  verifyPassed: boolean;
}): ReviewDecision {
  if (input.error) {
    return { outcome: 'failed', push: false, headerCategory: 'failed' };
  }

  if (input.commits === 0 && input.completed) {
    return { outcome: 'clean', push: false, headerCategory: 'clean' };
  }

  if (input.commits > 0 && input.verifyPassed && input.completed) {
    return { outcome: 'fixed', push: true, headerCategory: 'fixed' };
  }

  return { outcome: 'flagged', push: false, headerCategory: 'flagged' };
}
