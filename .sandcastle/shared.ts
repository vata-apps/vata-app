import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import type { IterationResult } from '@ai-hero/sandcastle';

// Helpers and constants shared by the sandcastle entry points
// (run.ts, review.ts).

export const MODEL_SONNET = 'sonnet';
export const MODEL_OPUS = 'opus';

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

/**
 * Extract a markdown `## <heading>` section's body, up to the next `## `
 * heading or the end of the text. Returns null if the heading isn't present.
 */
export function extractSection(text: string, heading: string): string | null {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`##\\s*${escaped}\\s*\\n([\\s\\S]*?)(?:\\n##\\s|$)`, 'i'));
  return match ? match[1].trim() : null;
}

/** Whether text is empty or just the prompts' literal "None"/"None." placeholder. */
export function isNonePlaceholder(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length === 0 || /^none\.?$/i.test(trimmed);
}

/**
 * Whether a `<review-findings>` block's "Flagged for maintainer" section has
 * actual content, as opposed to the prompt's literal "None" placeholder.
 * Returns false (no flagged findings) if the section is missing entirely —
 * the same conservative default as a missing findings block altogether.
 */
export function hasFlaggedFindings(findingsText: string | null): boolean {
  if (!findingsText) return false;
  const section = extractSection(findingsText, 'Flagged for maintainer');
  return section !== null && !isNonePlaceholder(section);
}

/**
 * Whether a `<fixes-to-apply>` block has actual content, as opposed to the
 * analysis prompt's literal "None" placeholder. Returns false (nothing to
 * apply) if the block is missing entirely.
 */
export function hasFixesToApply(fixesText: string | null): boolean {
  return fixesText !== null && !isNonePlaceholder(fixesText);
}

export interface FixOutcome {
  title: string;
  applied: boolean;
  /** Short commit SHA when applied, or the reason it wasn't when not. */
  detail: string;
}

/**
 * Parse a `<fixes-applied>` block (one `### Fix N: <title>` entry per fix,
 * each with a `- Status: applied|not applied` line and either `- Commit:` or
 * `- Reason:`) into structured outcomes. Unparseable or missing input yields
 * an empty array — callers treat that the same as "nothing to report".
 */
export function parseFixOutcomes(text: string | null): FixOutcome[] {
  if (!text) return [];
  const entries = text.split(/^###\s*Fix\s+\d+:\s*/im).slice(1);
  return entries.map((entry) => {
    const title = entry.split('\n')[0].trim();
    const applied = /-\s*Status:\s*applied\b/i.test(entry);
    const detailMatch = entry.match(/-\s*(?:Commit|Reason):\s*(.+)/i);
    return { title, applied, detail: detailMatch ? detailMatch[1].trim() : '' };
  });
}

/**
 * Deterministically assemble the final `<review-findings>` body from the
 * analysis stage's own Summary/Flagged content (kept verbatim — never
 * re-transcribed by another agent) plus the fix stage's structured outcomes.
 */
export function buildFinalFindings(input: {
  summary: string;
  flagged: string;
  outcomes: FixOutcome[];
}): string {
  const fixed = input.outcomes.filter((o) => o.applied);
  const notApplied = input.outcomes.filter((o) => !o.applied);

  const fixedSection = fixed.length
    ? fixed.map((o) => `- ${o.title}: ${o.detail}`).join('\n')
    : 'None';

  const flaggedLines = [
    ...(isNonePlaceholder(input.flagged) ? [] : [input.flagged]),
    ...notApplied.map((o) => `- ${o.title} (not applied — ${o.detail})`),
  ];
  const flaggedSection = flaggedLines.length ? flaggedLines.join('\n') : 'None';

  return `## Summary\n\n${input.summary}\n\n## Fixed\n\n${fixedSection}\n\n## Flagged for maintainer\n\n${flaggedSection}`;
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

export type ReviewOutcome = 'fixed' | 'clean' | 'noted' | 'flagged' | 'failed';

export interface ReviewDecision {
  outcome: ReviewOutcome;
  push: boolean;
  headerCategory: ReviewOutcome;
  /**
   * Whether nothing is left for the maintainer to judge — `clean` found
   * nothing, `fixed` found and fixed everything with verify green. The
   * workflow still ANDs this with the push step's actual runtime result
   * (unknown at this point, since pushing happens after this function
   * returns) before calling `gh pr review --approve`.
   */
  approve: boolean;
}

/**
 * Decide what to do after a reviewer run.
 *
 * This is the single testable seam for the review outcome. It takes only the
 * run facts and returns the outcome classification, whether to push, the
 * comment header category, and whether the PR is approvable.
 *
 * `noted` vs `flagged` both mean "nothing was pushed", but for different
 * reasons: `noted` is when the analysis never considered anything fixable in
 * the first place (`hadFixesToApply` false) and the flagged items are pure
 * judgment calls; `flagged` is when defects *were* identified but couldn't be
 * safely applied (verify stayed red, or iterations ran out mid-fix) — the
 * comment header wording differs accordingly so "nothing to fix, see notes"
 * isn't confused with "found issues, couldn't safely fix".
 *
 * Outcome table:
 * | Case                                                       | Outcome | Push                    | Approve |
 * |--------------------------------------------------------------|---------|-------------------------|---------|
 * | Defects found + fixed, verify green                          | fixed   | yes                     | yes     |
 * | Nothing found, nothing to flag                               | clean   | no                      | yes     |
 * | Nothing was fixable, but something is flagged for judgment   | noted   | no                      | no      |
 * | Defects found but unfixed (verify red / iterations exhausted) | flagged | yes if any fix is green | no      |
 * | Run errored                                                   | failed  | no                      | no      |
 */
export function decideReviewOutcome(input: {
  error: boolean;
  commits: number;
  completed: boolean;
  verifyPassed: boolean;
  hasFlaggedFindings: boolean;
  hadFixesToApply: boolean;
}): ReviewDecision {
  if (input.error) {
    return { outcome: 'failed', push: false, headerCategory: 'failed', approve: false };
  }

  if (input.commits === 0 && !input.hasFlaggedFindings && input.completed) {
    return { outcome: 'clean', push: false, headerCategory: 'clean', approve: true };
  }

  if (input.commits > 0 && input.verifyPassed && input.completed && !input.hasFlaggedFindings) {
    return { outcome: 'fixed', push: true, headerCategory: 'fixed', approve: true };
  }

  if (!input.hadFixesToApply && input.completed) {
    return { outcome: 'noted', push: false, headerCategory: 'noted', approve: false };
  }

  const push = input.commits > 0 && input.verifyPassed;
  return { outcome: 'flagged', push, headerCategory: 'flagged', approve: false };
}
