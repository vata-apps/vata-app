import { describe, expect, it } from 'vitest';
import {
  buildFinalFindings,
  decideReviewOutcome,
  extractSection,
  hasFixesToApply,
  hasFlaggedFindings,
  parseFixOutcomes,
  type ReviewOutcome,
} from './shared';

describe('decideReviewOutcome', () => {
  const cases: Array<{
    name: string;
    input: {
      error: boolean;
      commits: number;
      completed: boolean;
      verifyPassed: boolean;
      hasFlaggedFindings: boolean;
      hadFixesToApply: boolean;
    };
    expected: {
      outcome: ReviewOutcome;
      push: boolean;
      headerCategory: ReviewOutcome;
    };
  }> = [
    {
      name: 'defects found and fixed, verify green, completed, nothing flagged',
      input: {
        error: false,
        commits: 2,
        completed: true,
        verifyPassed: true,
        hasFlaggedFindings: false,
        hadFixesToApply: true,
      },
      expected: { outcome: 'fixed', push: true, headerCategory: 'fixed' },
    },
    {
      name: 'nothing to fix and nothing flagged',
      input: {
        error: false,
        commits: 0,
        completed: true,
        verifyPassed: false,
        hasFlaggedFindings: false,
        hadFixesToApply: false,
      },
      expected: { outcome: 'clean', push: false, headerCategory: 'clean' },
    },
    {
      name: 'nothing was ever fixable, but something is flagged for judgment',
      input: {
        error: false,
        commits: 0,
        completed: true,
        verifyPassed: false,
        hasFlaggedFindings: true,
        hadFixesToApply: false,
      },
      expected: { outcome: 'noted', push: false, headerCategory: 'noted' },
    },
    {
      name: 'no fixes proposed but the run never completed — still flagged, not noted',
      input: {
        error: false,
        commits: 0,
        completed: false,
        verifyPassed: false,
        hasFlaggedFindings: true,
        hadFixesToApply: false,
      },
      expected: { outcome: 'flagged', push: false, headerCategory: 'flagged' },
    },
    {
      name: 'defects proposed and attempted but verify red after fix',
      input: {
        error: false,
        commits: 2,
        completed: true,
        verifyPassed: false,
        hasFlaggedFindings: false,
        hadFixesToApply: true,
      },
      expected: { outcome: 'flagged', push: false, headerCategory: 'flagged' },
    },
    {
      name: 'fixes green and completed, but some issues also flagged — still pushes the good fixes',
      input: {
        error: false,
        commits: 2,
        completed: true,
        verifyPassed: true,
        hasFlaggedFindings: true,
        hadFixesToApply: true,
      },
      expected: { outcome: 'flagged', push: true, headerCategory: 'flagged' },
    },
    {
      name: 'iterations exhausted with commits and verify green still pushes',
      input: {
        error: false,
        commits: 1,
        completed: false,
        verifyPassed: true,
        hasFlaggedFindings: false,
        hadFixesToApply: true,
      },
      expected: { outcome: 'flagged', push: true, headerCategory: 'flagged' },
    },
    {
      name: 'iterations exhausted without commits',
      input: {
        error: false,
        commits: 0,
        completed: false,
        verifyPassed: false,
        hasFlaggedFindings: false,
        hadFixesToApply: true,
      },
      expected: { outcome: 'flagged', push: false, headerCategory: 'flagged' },
    },
    {
      name: 'run errored overrides all other facts',
      input: {
        error: true,
        commits: 2,
        completed: true,
        verifyPassed: true,
        hasFlaggedFindings: false,
        hadFixesToApply: true,
      },
      expected: { outcome: 'failed', push: false, headerCategory: 'failed' },
    },
    {
      name: 'run errored with no commits',
      input: {
        error: true,
        commits: 0,
        completed: false,
        verifyPassed: false,
        hasFlaggedFindings: false,
        hadFixesToApply: false,
      },
      expected: { outcome: 'failed', push: false, headerCategory: 'failed' },
    },
  ];

  it.each(cases)('$name', ({ input, expected }) => {
    expect(decideReviewOutcome(input)).toEqual(expected);
  });
});

describe('hasFlaggedFindings', () => {
  it('returns false when the findings block is missing', () => {
    expect(hasFlaggedFindings(null)).toBe(false);
  });

  it('returns false when the section says "None"', () => {
    const text = '## Fixed\n\nNone\n\n## Flagged for maintainer\n\nNone\n';
    expect(hasFlaggedFindings(text)).toBe(false);
  });

  it('returns false when the section says "None." with trailing punctuation', () => {
    const text = '## Flagged for maintainer\n\nNone.\n';
    expect(hasFlaggedFindings(text)).toBe(false);
  });

  it('returns true when the section lists an actual issue', () => {
    const text =
      '## Fixed\n\nNone\n\n## Flagged for maintainer\n\n- The retry logic looks subjective, left as-is\n';
    expect(hasFlaggedFindings(text)).toBe(true);
  });

  it('returns true when the flagged section is the last one in the block', () => {
    const text =
      '## Summary\n\nReviewed the diff.\n\n## Flagged for maintainer\n\n- Uses a magic number\n';
    expect(hasFlaggedFindings(text)).toBe(true);
  });

  it('returns false when the section heading is absent entirely', () => {
    const text = '## Summary\n\nEverything looks fine.\n\n## Fixed\n\nNone\n';
    expect(hasFlaggedFindings(text)).toBe(false);
  });
});

describe('hasFixesToApply', () => {
  it('returns false when the block is missing', () => {
    expect(hasFixesToApply(null)).toBe(false);
  });

  it('returns false when the block says "None"', () => {
    expect(hasFixesToApply('None')).toBe(false);
  });

  it('returns false when the block says "None." with trailing punctuation and whitespace', () => {
    expect(hasFixesToApply('  None.  \n')).toBe(false);
  });

  it('returns true when the block lists an actual fix', () => {
    const text =
      '### Fix 1: missing column list\n- File: src/db/trees/places.ts\n- Fix: list explicit columns instead of a wildcard select';
    expect(hasFixesToApply(text)).toBe(true);
  });
});

describe('extractSection', () => {
  it('returns null when the heading is absent', () => {
    expect(extractSection('## Summary\n\nAll good.\n', 'Flagged for maintainer')).toBeNull();
  });

  it('extracts a section up to the next heading', () => {
    const text = '## Summary\n\nAll good.\n\n## Flagged for maintainer\n\n- One issue\n';
    expect(extractSection(text, 'Summary')).toBe('All good.');
  });

  it('extracts the last section up to the end of the text', () => {
    const text = '## Summary\n\nAll good.\n\n## Flagged for maintainer\n\n- One issue\n';
    expect(extractSection(text, 'Flagged for maintainer')).toBe('- One issue');
  });
});

describe('parseFixOutcomes', () => {
  it('returns an empty array when the block is missing', () => {
    expect(parseFixOutcomes(null)).toEqual([]);
  });

  it('parses an applied fix with its commit SHA', () => {
    const text = '### Fix 1: missing column list\n- Status: applied\n- Commit: abc1234\n';
    expect(parseFixOutcomes(text)).toEqual([
      { title: 'missing column list', applied: true, detail: 'abc1234' },
    ]);
  });

  it('parses a not-applied fix with its reason', () => {
    const text = '### Fix 1: risky migration\n- Status: not applied\n- Reason: verify stayed red\n';
    expect(parseFixOutcomes(text)).toEqual([
      { title: 'risky migration', applied: false, detail: 'verify stayed red' },
    ]);
  });

  it('parses multiple entries in order', () => {
    const text =
      '### Fix 1: first\n- Status: applied\n- Commit: aaa1111\n\n### Fix 2: second\n- Status: not applied\n- Reason: protected path\n';
    expect(parseFixOutcomes(text)).toEqual([
      { title: 'first', applied: true, detail: 'aaa1111' },
      { title: 'second', applied: false, detail: 'protected path' },
    ]);
  });
});

describe('buildFinalFindings', () => {
  it('reports "None" for Fixed and Flagged when there is nothing to report', () => {
    const result = buildFinalFindings({
      summary: 'Reviewed the diff.',
      flagged: 'None',
      outcomes: [],
    });
    expect(result).toBe(
      '## Summary\n\nReviewed the diff.\n\n## Fixed\n\nNone\n\n## Flagged for maintainer\n\nNone'
    );
  });

  it('lists applied fixes under Fixed', () => {
    const result = buildFinalFindings({
      summary: 'Reviewed the diff.',
      flagged: 'None',
      outcomes: [{ title: 'missing column list', applied: true, detail: 'abc1234' }],
    });
    expect(result).toContain('## Fixed\n\n- missing column list: abc1234');
  });

  it('appends not-applied fixes to the original flagged content', () => {
    const result = buildFinalFindings({
      summary: 'Reviewed the diff.',
      flagged: '- The retry logic looks subjective, left as-is',
      outcomes: [{ title: 'risky migration', applied: false, detail: 'verify stayed red' }],
    });
    expect(result).toContain(
      '## Flagged for maintainer\n\n- The retry logic looks subjective, left as-is\n- risky migration (not applied — verify stayed red)'
    );
  });
});
