import { describe, expect, it } from 'vitest';

import { getTreeIdFromPath, isFullWidthDetailRoute, resolveNavSection } from './nav-sections';

describe('resolveNavSection', () => {
  it('resolves the bare tree path to the home section', () => {
    expect(resolveNavSection('/tree/42')).toBe('home');
    expect(resolveNavSection('/tree/42/')).toBe('home');
  });

  it('resolves the individuals list and an individual detail to the people section', () => {
    expect(resolveNavSection('/tree/42/individuals')).toBe('people');
    expect(resolveNavSection('/tree/42/individual/I-0001')).toBe('people');
  });

  it('resolves the families list and a family detail to the families section', () => {
    expect(resolveNavSection('/tree/42/families')).toBe('families');
    expect(resolveNavSection('/tree/42/family/F-0002')).toBe('families');
  });

  it('resolves an in-tree path with no matching section to null', () => {
    // Segments with no route (a removed module, an unknown path) map to null.
    expect(resolveNavSection('/tree/42/sources')).toBeNull();
    expect(resolveNavSection('/tree/42/unknown')).toBeNull();
  });

  it('resolves a path outside the in-tree shell to null', () => {
    expect(resolveNavSection('/')).toBeNull();
    expect(resolveNavSection('/tree')).toBeNull();
  });
});

describe('isFullWidthDetailRoute', () => {
  it('treats an individual detail route as full-width', () => {
    expect(isFullWidthDetailRoute('/tree/42/individual/I-0001')).toBe(true);
  });

  it('treats the individuals list and the bare individual segment as not full-width', () => {
    expect(isFullWidthDetailRoute('/tree/42/individuals')).toBe(false);
    expect(isFullWidthDetailRoute('/tree/42/individual')).toBe(false);
  });

  it('treats other detail routes and outside paths as not full-width', () => {
    expect(isFullWidthDetailRoute('/tree/42/family/F-0002')).toBe(false);
    expect(isFullWidthDetailRoute('/tree/42')).toBe(false);
    expect(isFullWidthDetailRoute('/')).toBe(false);
  });
});

describe('getTreeIdFromPath', () => {
  it('returns the tree id of an in-tree path', () => {
    expect(getTreeIdFromPath('/tree/42')).toBe('42');
    expect(getTreeIdFromPath('/tree/abc-123/individuals')).toBe('abc-123');
    expect(getTreeIdFromPath('/tree/42/individual/I-0001')).toBe('42');
  });

  it('returns null for a path outside the in-tree shell', () => {
    expect(getTreeIdFromPath('/')).toBeNull();
    expect(getTreeIdFromPath('/tree')).toBeNull();
  });
});
