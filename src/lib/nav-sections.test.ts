import { describe, expect, it } from 'vitest';

import { getTreeIdFromPath, resolveNavSection } from './nav-sections';

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

  it('resolves the sources list, a source detail and a source edit to the sources section', () => {
    expect(resolveNavSection('/tree/42/sources')).toBe('sources');
    expect(resolveNavSection('/tree/42/source/S-0003')).toBe('sources');
    expect(resolveNavSection('/tree/42/source/S-0003/edit')).toBe('sources');
  });

  it('resolves the repositories list and a repository detail to the repositories section', () => {
    expect(resolveNavSection('/tree/42/repositories')).toBe('repositories');
    expect(resolveNavSection('/tree/42/repository/R-0004')).toBe('repositories');
  });

  it('resolves an in-tree path with no matching section to null', () => {
    expect(resolveNavSection('/tree/42/data')).toBeNull();
  });

  it('resolves a path outside the in-tree shell to null', () => {
    expect(resolveNavSection('/')).toBeNull();
    expect(resolveNavSection('/tree')).toBeNull();
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
