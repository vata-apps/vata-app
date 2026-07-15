import { describe, expect, it } from 'vitest';
import { decideReviewOutcome, type ReviewOutcome } from './shared';

describe('decideReviewOutcome', () => {
  const cases: Array<{
    name: string;
    input: {
      error: boolean;
      commits: number;
      completed: boolean;
      verifyPassed: boolean;
    };
    expected: {
      outcome: ReviewOutcome;
      push: boolean;
      headerCategory: ReviewOutcome;
    };
  }> = [
    {
      name: 'defects found and fixed, verify green, completed',
      input: { error: false, commits: 2, completed: true, verifyPassed: true },
      expected: { outcome: 'fixed', push: true, headerCategory: 'fixed' },
    },
    {
      name: 'nothing to fix',
      input: { error: false, commits: 0, completed: true, verifyPassed: false },
      expected: { outcome: 'clean', push: false, headerCategory: 'clean' },
    },
    {
      name: 'defects found but verify red after fix',
      input: { error: false, commits: 2, completed: true, verifyPassed: false },
      expected: { outcome: 'flagged', push: false, headerCategory: 'flagged' },
    },
    {
      name: 'iterations exhausted with commits and verify green',
      input: { error: false, commits: 1, completed: false, verifyPassed: true },
      expected: { outcome: 'flagged', push: false, headerCategory: 'flagged' },
    },
    {
      name: 'iterations exhausted without commits',
      input: { error: false, commits: 0, completed: false, verifyPassed: false },
      expected: { outcome: 'flagged', push: false, headerCategory: 'flagged' },
    },
    {
      name: 'run errored overrides all other facts',
      input: { error: true, commits: 2, completed: true, verifyPassed: true },
      expected: { outcome: 'failed', push: false, headerCategory: 'failed' },
    },
    {
      name: 'run errored with no commits',
      input: { error: true, commits: 0, completed: false, verifyPassed: false },
      expected: { outcome: 'failed', push: false, headerCategory: 'failed' },
    },
  ];

  it.each(cases)('$name', ({ input, expected }) => {
    expect(decideReviewOutcome(input)).toEqual(expected);
  });
});
