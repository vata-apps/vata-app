import { Box, Card, Flex, Grid, Progress, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import type { OverviewChecklistItem, OverviewMediaTile, OverviewSuggestion } from './overview-mock';
import { PANEL_SURFACE, PanelTitle } from './panel';

interface ProfileAsideProps {
  completion: { percent: number; items: OverviewChecklistItem[] };
  media: OverviewMediaTile[];
  suggestions: OverviewSuggestion[];
}

/**
 * The right column of the Person Overview: profile-completion progress, a
 * media grid, a research-notes panel, and research suggestions.
 */
export function ProfileAside({ completion, media, suggestions }: ProfileAsideProps): JSX.Element {
  return (
    <Flex direction="column" gap="4">
      <ProfileCompletion percent={completion.percent} items={completion.items} />
      <MediaPanel media={media} />
      <ResearchNotes />
      <Suggestions suggestions={suggestions} />
    </Flex>
  );
}

function ProfileCompletion({
  percent,
  items,
}: {
  percent: number;
  items: OverviewChecklistItem[];
}): JSX.Element {
  const { t } = useTranslation('individuals');
  const done = items.filter((item) => item.done).length;
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <PanelTitle>{t('overview.completion.title')}</PanelTitle>
          <Text size="2" color="gray">
            {percent}%
          </Text>
        </Flex>
        <Progress value={percent} color="teal" size="2" />
        <Flex direction="column" gap="2">
          {items.map((item) => (
            <Flex key={item.key} align="center" gap="2">
              <Icon
                name={item.done ? 'circle-check' : 'circle'}
                size={16}
                style={{ color: item.done ? 'var(--teal-11)' : 'var(--gray-9)' }}
              />
              <Text size="2" style={{ color: item.done ? 'var(--gray-11)' : 'var(--gray-10)' }}>
                {t(`overview.completion.items.${item.key}`)}
              </Text>
            </Flex>
          ))}
        </Flex>
        <Text size="2" style={{ color: 'var(--gray-10)' }}>
          {t('overview.completion.footer', { done, total: items.length })}
        </Text>
      </Flex>
    </Card>
  );
}

function MediaPanel({ media }: { media: OverviewMediaTile[] }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex align="end" gap="2">
            <PanelTitle>{t('overview.media.title')}</PanelTitle>
            <Text size="2" color="gray">
              {media.length}
            </Text>
          </Flex>
          <Text size="2" color="teal">
            {t('overview.media.viewAll')} →
          </Text>
        </Flex>
        <Grid columns="2" gap="2">
          {media.map((tile) => (
            <Flex key={tile.caption} direction="column" gap="1">
              <Flex align="center" justify="center" height="72px" style={PANEL_SURFACE}>
                <Icon name={tile.icon} size={20} style={{ color: 'var(--gray-9)' }} />
              </Flex>
              <Text size="1" align="center" style={{ color: 'var(--gray-10)' }}>
                {tile.caption}
              </Text>
            </Flex>
          ))}
        </Grid>
      </Flex>
    </Card>
  );
}

function ResearchNotes(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <PanelTitle>{t('overview.researchNotes.title')}</PanelTitle>
        <Flex direction="column" align="center" justify="center" gap="2" px="3" py="5">
          <Icon name="pencil" size={22} style={{ color: 'var(--gray-9)' }} />
          <Text size="2" align="center" style={{ color: 'var(--gray-10)' }}>
            {t('overview.researchNotes.empty')}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}

function Suggestions({ suggestions }: { suggestions: OverviewSuggestion[] }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <PanelTitle>{t('overview.suggestions.title')}</PanelTitle>
        <Flex direction="column">
          {suggestions.map((suggestion, i) => (
            <Flex
              key={suggestion.text}
              align="center"
              gap="3"
              py="3"
              style={
                i < suggestions.length - 1
                  ? { borderBottom: '1px solid var(--gray-a5)' }
                  : undefined
              }
            >
              <Box flexShrink="0">
                <Icon name={suggestion.icon} size={18} style={{ color: 'var(--gray-9)' }} />
              </Box>
              <Text size="2" color="gray">
                {suggestion.text}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}
