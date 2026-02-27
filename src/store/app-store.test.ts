import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store';

beforeEach(() => {
  useAppStore.setState({ currentTreeId: null });
});

describe('app store — active tree', () => {
  it('has no active tree on first load', () => {
    expect(useAppStore.getState().currentTreeId).toBeNull();
  });

  it('reflects the tree that was opened', () => {
    useAppStore.getState().setCurrentTree('42');
    expect(useAppStore.getState().currentTreeId).toBe('42');
  });

  it('reflects the latest tree when switching between trees', () => {
    useAppStore.getState().setCurrentTree('1');
    useAppStore.getState().setCurrentTree('2');
    expect(useAppStore.getState().currentTreeId).toBe('2');
  });

  it('has no active tree after closing the current tree', () => {
    useAppStore.getState().setCurrentTree('5');
    useAppStore.getState().setCurrentTree(null);
    expect(useAppStore.getState().currentTreeId).toBeNull();
  });
});
