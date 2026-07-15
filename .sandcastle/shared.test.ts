import { describe, expect, it } from 'vitest';
import { decideReviewOutcome, hasFlaggedFindings, type ReviewOutcome } from './shared';

describe('decideReviewOutcome', () => {
  const cases: Array<{
    name: string;
    input: {
      error: boolean;
      commits: number;
      completed: boolean;
      verifyPassed: boolean;
      hasFlaggedFindings: boolean;
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
      },
      expected: { outcome: 'clean', push: false, headerCategory: 'clean' },
    },
    {
      name: 'nothing fixed but issues flagged is not clean',
      input: {
        error: false,
        commits: 0,
        completed: true,
        verifyPassed: false,
        hasFlaggedFindings: true,
      },
      expected: { outcome: 'flagged', push: false, headerCategory: 'flagged' },
    },
    {
      name: 'defects found but verify red after fix',
      input: {
        error: false,
        commits: 2,
        completed: true,
        verifyPassed: false,
        hasFlaggedFindings: false,
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
