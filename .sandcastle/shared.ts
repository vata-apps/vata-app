import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import type { IterationResult } from '@ai-hero/sandcastle';

// Helpers and constants shared by the two sandcastle entry points
// (run.ts, address-review.ts).

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
