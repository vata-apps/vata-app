import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import type { IterationResult } from '@ai-hero/sandcastle';

// Helpers and constants shared by the two sandcastle entry points
// (run.ts, address-review.ts).

export const MODEL_OPUS = 'claude-opus-4-7';
export const MODEL_SONNET = 'claude-sonnet-4-6';

// Anthropic list prices ($/Mtok) — 5-minute cache TTL (sandcastle default).
// Update when Anthropic changes them.
const RATES_PER_MTOK: Record<
  string,
  { input: number; output: number; cacheRead: number; cacheWrite: number }
> = {
  [MODEL_OPUS]: { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  [MODEL_SONNET]: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
};

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

export function logCost(model: string, iterations: readonly IterationResult[]): void {
  const totals = iterations.reduce(
    (acc, it) => {
      if (!it.usage) return acc;
      return {
        input: acc.input + it.usage.inputTokens,
        output: acc.output + it.usage.outputTokens,
        cacheRead: acc.cacheRead + it.usage.cacheReadInputTokens,
        cacheWrite: acc.cacheWrite + it.usage.cacheCreationInputTokens,
      };
    },
    { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  );

  const fmt = (n: number) => n.toLocaleString('en-US');
  console.log('\nRun cost (estimate)');
  console.log(`  Model:        ${model}`);
  console.log(`  Input:        ${fmt(totals.input)} tokens`);
  console.log(`  Output:       ${fmt(totals.output)} tokens`);
  console.log(`  Cache read:   ${fmt(totals.cacheRead)} tokens`);
  console.log(`  Cache write:  ${fmt(totals.cacheWrite)} tokens`);

  const rates = RATES_PER_MTOK[model];
  if (!rates) {
    console.log(`  Estimated:    (no rate table for ${model})`);
    return;
  }
  const dollars =
    (totals.input * rates.input +
      totals.output * rates.output +
      totals.cacheRead * rates.cacheRead +
      totals.cacheWrite * rates.cacheWrite) /
    1_000_000;
  console.log(`  Estimated:    $${dollars.toFixed(4)}`);
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
