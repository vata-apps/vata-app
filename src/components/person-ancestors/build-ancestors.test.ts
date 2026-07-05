import { describe, it, expect, vi } from 'vitest';

// `build-ancestors` reuses `formatName`, which transitively imports the
// Tauri-backed DB connection. Stub it so the pure layout builder can be
// tested without a real database.
vi.mock('$db/connection', () => ({ getTreeDb: vi.fn() }));

import type { AncestorPerson, AncestorSlot, AncestorTree } from '$db-tree/ancestors';
import { buildAncestorsChart } from './build-ancestors';

function makeAncestor(
  id: string,
  givenNames: string,
  surname: string,
  overrides: Partial<AncestorPerson> = {}
): AncestorPerson {
  return {
    id,
    primaryName: {
      id: `${id}-name`,
      individualId: id,
      type: 'birth',
      prefix: null,
      givenNames,
      surname,
      suffix: null,
      nickname: null,
      isPrimary: true,
      createdAt: '',
      updatedAt: '',
    },
    birthYear: null,
    deathYear: null,
    gender: 'U',
    ...overrides,
  };
}

function makeTree(generations: AncestorSlot[][]): AncestorTree {
  return { generations };
}

describe('buildAncestorsChart', () => {
  it('always renders the full fixed-width skeleton, even with no known ancestors', () => {
    const subject = makeAncestor('I-1', 'Harry', 'Potter');
    const tree = makeTree([[subject], [null, null], [null, null, null, null]]);

    const layout = buildAncestorsChart(tree);

    expect(layout.nodes).toHaveLength(7); // 1 + 2 + 4
    expect(layout.links).toHaveLength(6); // a tree always has n - 1 edges
    expect(layout.nodes.filter((node) => node.person === null)).toHaveLength(6);
  });

  it('marks exactly the depth-0 node as focal', () => {
    const subject = makeAncestor('I-1', 'Harry', 'Potter');
    const layout = buildAncestorsChart(makeTree([[subject], [null, null]]));

    const focal = layout.nodes.filter((node) => node.isFocal);
    expect(focal).toHaveLength(1);
    expect(focal[0].person?.id).toBe('I-1');
  });

  it('resolves a known ancestor to their name and birth year, and leaves an unknown slot personless', () => {
    const subject = makeAncestor('I-1', 'Harry', 'Potter');
    const father = makeAncestor('I-2', 'James', 'Potter', { birthYear: 1960 });
    const layout = buildAncestorsChart(makeTree([[subject], [father, null]]));

    const fatherNode = layout.nodes.find((node) => node.person?.id === 'I-2');
    const motherNode = layout.nodes.find((node) => node.depth === 1 && node.person === null);

    expect(fatherNode?.person).toEqual(
      expect.objectContaining({ name: 'James Potter', bornYear: 1960 })
    );
    expect(motherNode).toBeDefined();
  });

  it('positions the first sibling slot (e.g. father) above the second (e.g. mother) at every generation', () => {
    const subject = makeAncestor('I-1', 'Harry', 'Potter');
    const father = makeAncestor('I-2', 'James', 'Potter');
    const mother = makeAncestor('I-3', 'Lily', 'Evans');
    const layout = buildAncestorsChart(makeTree([[subject], [father, mother]]));

    const fatherNode = layout.nodes.find((node) => node.person?.id === 'I-2')!;
    const motherNode = layout.nodes.find((node) => node.person?.id === 'I-3')!;

    expect(fatherNode.y).toBeLessThan(motherNode.y);
  });
});
