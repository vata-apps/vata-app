import { describe, it, expect } from 'vitest';

import { sortByKey } from './sortByKey';

/** Read the values back out in sorted order, for concise assertions. */
function order<T>(
  items: T[],
  keyOf: (item: T) => string | number | null,
  direction?: 'asc' | 'desc'
) {
  return sortByKey(items, keyOf, direction).map(keyOf);
}

describe('sortByKey', () => {
  it('sorts strings ascending and locale-aware by default', () => {
    const items = ['Zoé', 'Albert', 'éric', 'Bernard'];
    expect(sortByKey(items, (s) => s)).toEqual(['Albert', 'Bernard', 'éric', 'Zoé']);
  });

  it('sorts strings descending when direction is "desc"', () => {
    const items = ['Albert', 'Zoé', 'Bernard'];
    expect(sortByKey(items, (s) => s, 'desc')).toEqual(['Zoé', 'Bernard', 'Albert']);
  });

  it('sorts numbers numerically, not lexically', () => {
    const items = [2, 10, 1, 100];
    expect(order(items, (n) => n)).toEqual([1, 2, 10, 100]);
    expect(order(items, (n) => n, 'desc')).toEqual([100, 10, 2, 1]);
  });

  it('keeps null keys last when ascending', () => {
    const items = [{ k: 'b' }, { k: null }, { k: 'a' }];
    expect(order(items, (x) => x.k)).toEqual(['a', 'b', null]);
  });

  it('keeps null keys last even when descending', () => {
    const items = [{ k: 'b' }, { k: null }, { k: 'a' }];
    expect(order(items, (x) => x.k, 'desc')).toEqual(['b', 'a', null]);
  });

  it('keeps null number keys last in both directions', () => {
    const items = [{ k: 5 }, { k: null }, { k: 1 }];
    expect(order(items, (x) => x.k, 'asc')).toEqual([1, 5, null]);
    expect(order(items, (x) => x.k, 'desc')).toEqual([5, 1, null]);
  });

  it('does not mutate the input array', () => {
    const items = ['c', 'a', 'b'];
    const copy = [...items];
    sortByKey(items, (s) => s);
    expect(items).toEqual(copy);
  });

  it('returns an empty array unchanged', () => {
    expect(sortByKey([], (x: string) => x)).toEqual([]);
  });
});
