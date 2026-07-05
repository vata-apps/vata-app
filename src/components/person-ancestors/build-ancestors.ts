import { hierarchy, tree as d3Tree, type HierarchyPointNode } from 'd3-hierarchy';

import type { AncestorSlot, AncestorTree } from '$db-tree/ancestors';
import type { PersonRefData } from '$components/person-overview/overview-types';
import { toPersonRef as toPersonRefBase } from '$components/person-overview/to-person-ref';

/** One positioned card in the chart — `person` is `null` for an unrecorded ancestor. */
export interface AncestorChartNode {
  id: string;
  depth: number;
  x: number;
  y: number;
  person: PersonRefData | null;
  isFocal: boolean;
}

/** One connector line between a node and its parent, as an SVG path `d` string. */
export interface AncestorChartLink {
  id: string;
  path: string;
}

export interface AncestorChartLayout {
  width: number;
  height: number;
  nodes: AncestorChartNode[];
  links: AncestorChartLink[];
}

/**
 * Pixel footprint of one card — the single source of truth shared with
 * `AncestorsChart`, which stretches every card to exactly this size regardless
 * of content. `AncestorsChart` renders `PersonRef` in its `compact` shape
 * (small avatar, dates inline after the name on one line), so the card only
 * needs to fit one text line tall. Wide enough for a multi-word given name
 * (e.g. "Harry James Potter") plus its inline dates on that one line. Kept
 * tight — with up to 8 cards stacked in the deepest generation, every extra
 * pixel of height multiplies by 8.
 */
export const ANCESTOR_NODE_WIDTH = 248;
export const ANCESTOR_NODE_HEIGHT = 48;

const ROW_GAP = 10;
const COLUMN_GAP = 40;
const PADDING = 24;

/** An {@link AncestorSlot} reduced to the `PersonRef` shape, or `null` for an unrecorded ancestor. */
function toPersonRef(slot: AncestorSlot): PersonRefData | null {
  return slot ? toPersonRefBase(slot) : null;
}

interface RawNode {
  slot: AncestorSlot;
  depth: number;
  index: number;
  children?: RawNode[];
}

/**
 * Build the full fixed-width skeleton as a nested tree for `d3-hierarchy` —
 * always recursing to the last generation regardless of unknown slots, since
 * the chart renders the same card shape everywhere.
 */
function toRawTree(generations: AncestorSlot[][], depth: number, index: number): RawNode {
  const slot = generations[depth][index];
  if (depth + 1 >= generations.length) return { slot, depth, index };
  return {
    slot,
    depth,
    index,
    children: [
      toRawTree(generations, depth + 1, index * 2),
      toRawTree(generations, depth + 1, index * 2 + 1),
    ],
  };
}

/**
 * Pixel position of a positioned d3 node, after swapping axes for horizontal
 * orientation. `node.y` (the depth axis, in `nodeSize` mode) is always exactly
 * `depth * (ANCESTOR_NODE_WIDTH + COLUMN_GAP)` — a closed form, no scan needed
 * — so only the spread axis (`node.x`, d3's tidy-tree centering) needs its
 * min offset passed in.
 */
function pixelOf(node: HierarchyPointNode<RawNode>, minSpread: number) {
  return {
    x: node.y + ANCESTOR_NODE_WIDTH / 2 + PADDING,
    y: node.x - minSpread + ANCESTOR_NODE_HEIGHT / 2 + PADDING,
  };
}

/**
 * Lay out a fixed-depth {@link AncestorTree} for a horizontal pedigree chart:
 * the subject at the left, ancestors opening rightward one column per
 * generation. Uses `d3-hierarchy`'s tidy-tree algorithm for the vertical
 * spread — so every parent sits centered on its own branch — then swaps axes
 * for the horizontal orientation. Pure: no rendering, so every branch (a fully
 * known tree, an all-unknown tree, a single generation) can be asserted on
 * directly, without a DOM.
 */
export function buildAncestorsChart(tree: AncestorTree): AncestorChartLayout {
  const raw = toRawTree(tree.generations, 0, 0);
  const root = hierarchy(raw, (node) => node.children);
  const positioned = d3Tree<RawNode>().nodeSize([
    ANCESTOR_NODE_HEIGHT + ROW_GAP,
    ANCESTOR_NODE_WIDTH + COLUMN_GAP,
  ])(root);

  const descendants = positioned.descendants();
  const minSpread = Math.min(...descendants.map((node) => node.x));
  const maxSpread = Math.max(...descendants.map((node) => node.x));

  const nodes: AncestorChartNode[] = descendants.map((node) => {
    const { x, y } = pixelOf(node, minSpread);
    return {
      id: `g${node.data.depth}-${node.data.index}`,
      depth: node.data.depth,
      x,
      y,
      person: toPersonRef(node.data.slot),
      isFocal: node.data.depth === 0,
    };
  });

  // Each link touches the source card's right edge and the target card's left
  // edge — never the card center — so the line never runs underneath a card.
  const links: AncestorChartLink[] = positioned.links().map((link) => {
    const source = pixelOf(link.source, minSpread);
    const target = pixelOf(link.target, minSpread);
    const sourceEdgeX = source.x + ANCESTOR_NODE_WIDTH / 2;
    const targetEdgeX = target.x - ANCESTOR_NODE_WIDTH / 2;
    const midX = (sourceEdgeX + targetEdgeX) / 2;
    return {
      id: `l${link.target.data.depth}-${link.target.data.index}`,
      path: `M ${sourceEdgeX} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${targetEdgeX} ${target.y}`,
    };
  });

  const deepestGeneration = tree.generations.length - 1;
  const width =
    deepestGeneration * (ANCESTOR_NODE_WIDTH + COLUMN_GAP) + ANCESTOR_NODE_WIDTH + PADDING * 2;
  const height = maxSpread - minSpread + ANCESTOR_NODE_HEIGHT + PADDING * 2;

  return { width, height, nodes, links };
}
