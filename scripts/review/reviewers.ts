import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { minimatch } from 'minimatch';
import { z } from 'zod';

const fileCache = new Map<string, Promise<string | null>>();

function cachedReadFile(absPath: string): Promise<string | null> {
  let p = fileCache.get(absPath);
  if (!p) {
    p = readFile(absPath, 'utf8').catch((err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') return null;
      throw err;
    });
    fileCache.set(absPath, p);
  }
  return p;
}

const ReviewerSpec = z.object({
  patterns: z.array(z.string().min(1)).min(1),
  skills: z.array(z.string().min(1)).default([]),
  extraDocs: z.array(z.string().min(1)).default([]),
});
export type ReviewerSpec = z.infer<typeof ReviewerSpec>;

const ReviewersConfig = z.object({
  reviewers: z.record(z.string(), ReviewerSpec),
});
export type ReviewersConfig = z.infer<typeof ReviewersConfig>;

export async function loadReviewersConfig(repoRoot: string): Promise<ReviewersConfig> {
  const path = join(repoRoot, '.github', 'code-review', 'reviewers-config.json');
  const raw = await readFile(path, 'utf8');
  return ReviewersConfig.parse(JSON.parse(raw));
}

export function matchReviewers(
  config: ReviewersConfig,
  changedFiles: readonly string[]
): Array<{ name: string; spec: ReviewerSpec; matchedFiles: string[] }> {
  const result: Array<{
    name: string;
    spec: ReviewerSpec;
    matchedFiles: string[];
  }> = [];

  for (const [name, spec] of Object.entries(config.reviewers)) {
    const matched = filesMatchingPatterns(changedFiles, spec.patterns);
    if (matched.length > 0) {
      result.push({ name, spec, matchedFiles: matched });
    }
  }

  return result;
}

function filesMatchingPatterns(files: readonly string[], patterns: readonly string[]): string[] {
  const includes = patterns.filter((p) => !p.startsWith('!'));
  const excludes = patterns.filter((p) => p.startsWith('!')).map((p) => p.slice(1));

  return files.filter((file) => {
    const isIncluded = includes.some((p) => minimatch(file, p, { dot: true, matchBase: false }));
    if (!isIncluded) return false;
    const isExcluded = excludes.some((p) => minimatch(file, p, { dot: true, matchBase: false }));
    return !isExcluded;
  });
}

export async function loadSkillContent(repoRoot: string, skillName: string): Promise<string> {
  const path = join(repoRoot, '.claude', 'skills', skillName, 'SKILL.md');
  const content = await cachedReadFile(path);
  if (content === null) {
    throw new Error(`Skill not found: ${skillName} (looked at ${path})`);
  }
  return content;
}

export async function loadExtraDoc(repoRoot: string, relativePath: string): Promise<string | null> {
  return cachedReadFile(join(repoRoot, relativePath));
}

export async function buildReviewerContext(repoRoot: string, spec: ReviewerSpec): Promise<string> {
  const sections: string[] = [];

  for (const skill of spec.skills) {
    const content = await loadSkillContent(repoRoot, skill);
    sections.push(`## Skill: ${skill}\n\n${content}`);
  }

  for (const doc of spec.extraDocs) {
    const content = await loadExtraDoc(repoRoot, doc);
    if (content !== null) {
      sections.push(`## Reference doc: ${doc}\n\n${content}`);
    }
  }

  return sections.join('\n\n---\n\n');
}
