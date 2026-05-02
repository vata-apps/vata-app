import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { minimatch } from 'minimatch';
import { z } from 'zod';

const PersonaSpec = z.object({
  patterns: z.array(z.string().min(1)).min(1),
  skills: z.array(z.string().min(1)).default([]),
  extraDocs: z.array(z.string().min(1)).default([]),
});
export type PersonaSpec = z.infer<typeof PersonaSpec>;

const PersonaConfig = z.object({
  personas: z.record(z.string(), PersonaSpec),
});
export type PersonaConfig = z.infer<typeof PersonaConfig>;

export interface LoadedPersona {
  name: string;
  spec: PersonaSpec;
  matchedFiles: string[];
  context: string;
}

export async function loadPersonaConfig(repoRoot: string): Promise<PersonaConfig> {
  const path = join(repoRoot, '.github', 'code-review', 'persona-config.json');
  const raw = await readFile(path, 'utf8');
  return PersonaConfig.parse(JSON.parse(raw));
}

export function matchPersonas(
  config: PersonaConfig,
  changedFiles: readonly string[]
): Array<{ name: string; spec: PersonaSpec; matchedFiles: string[] }> {
  const result: Array<{
    name: string;
    spec: PersonaSpec;
    matchedFiles: string[];
  }> = [];

  for (const [name, spec] of Object.entries(config.personas)) {
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
  if (!existsSync(path)) {
    throw new Error(`Skill not found: ${skillName} (looked at ${path})`);
  }
  return readFile(path, 'utf8');
}

export async function loadExtraDoc(repoRoot: string, relativePath: string): Promise<string | null> {
  const path = join(repoRoot, relativePath);
  if (!existsSync(path)) return null;
  return readFile(path, 'utf8');
}

export async function buildPersonaContext(repoRoot: string, spec: PersonaSpec): Promise<string> {
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
