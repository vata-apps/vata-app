import { Box, Card, Flex, Grid, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { PersonRef } from '$components/person-overview/person-ref';
import {
  ANCESTOR_NODE_HEIGHT,
  ANCESTOR_NODE_WIDTH,
  type AncestorChartLayout,
  type AncestorChartNode,
} from './build-ancestors';

interface AncestorsChartProps {
  layout: AncestorChartLayout;
  treeId: string;
}

/**
 * One card: a bordered `Card` around a `PersonRef` for a known ancestor, the
 * focal marker, or an "Unknown" placeholder — every slot renders the same
 * fixed-size card frame, per the fixed skeleton this chart always shows. The
 * outer `Grid` (unlike `Flex`, stretches its child on both axes by default)
 * forces `Card` to fill its host `<foreignObject>` exactly, so the connector
 * lines — which target that fixed footprint's edges — always land precisely
 * on the card border.
 */
function AncestorCard({ node, treeId }: { node: AncestorChartNode; treeId: string }): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Grid width="100%" height="100%">
      <Card size="1" variant="surface">
        <Flex align="center" justify="start" height="100%">
          {node.person ? (
            <PersonRef
              person={node.person}
              treeId={treeId}
              variant={node.isFocal ? 'focal' : 'normal'}
              compact
            />
          ) : (
            <Text size="2" color="gray">
              {t('ancestors.unknown')}
            </Text>
          )}
        </Flex>
      </Card>
    </Grid>
  );
}

/**
 * The Pedigree / Ascendance tab's chart: a fixed 4-generation ancestor tree,
 * the subject at the left opening rightward. Layout (`d3-hierarchy`'s
 * tidy-tree, see {@link buildAncestorsChart}) and rendering are split: only
 * the connector lines are raw SVG themed with Radix CSS custom properties —
 * the same carve-out precedent as the Places map's Leaflet markers (ADR-0012,
 * ADR-0013) — while every card is real `PersonRef`/`IndividualLink` DOM
 * injected via `<foreignObject>`, so avatar, name, focus, and relation-jump
 * navigation are the reused Radix components, not a redrawn approximation.
 */
export function AncestorsChart({ layout, treeId }: AncestorsChartProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Box overflowX="auto">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
        role="img"
        aria-label={t('ancestors.chartLabel')}
      >
        <g>
          {layout.links.map((link) => (
            <path
              key={link.id}
              d={link.path}
              fill="none"
              stroke="var(--gray-a7)"
              strokeWidth={1.5}
            />
          ))}
        </g>
        {layout.nodes.map((node) => (
          <foreignObject
            key={node.id}
            x={node.x - ANCESTOR_NODE_WIDTH / 2}
            y={node.y - ANCESTOR_NODE_HEIGHT / 2}
            width={ANCESTOR_NODE_WIDTH}
            height={ANCESTOR_NODE_HEIGHT}
          >
            <AncestorCard node={node} treeId={treeId} />
          </foreignObject>
        ))}
      </svg>
    </Box>
  );
}
