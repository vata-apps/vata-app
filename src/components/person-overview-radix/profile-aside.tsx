import {
  Box,
  Card,
  Checkbox,
  Flex,
  Grid,
  Heading,
  Progress,
  Separator,
  Text,
} from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { OverviewChecklistItem, OverviewMediaTile, OverviewSuggestion } from './overview-mock';

interface ProfileAsideProps {
  completion: { percent: number; items: OverviewChecklistItem[] };
  media: OverviewMediaTile[];
  suggestions: OverviewSuggestion[];
}

/**
 * The right column: profile-completion progress, a media grid, a
 * research-notes panel, and research suggestions. Pure `@radix-ui/themes`:
 * `Progress` + `Checkbox` for completion, label-only `Card` tiles for media,
 * and `Separator`-divided `Text` rows for suggestions (no icons).
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
          <Heading size="3">{t('overview.completion.title')}</Heading>
          <Text size="2" color="gray">
            {percent}%
          </Text>
        </Flex>
        <Progress value={percent} color="teal" size="2" />
        <Flex direction="column" gap="2">
          {items.map((item) => (
            <Text key={item.key} as="label" size="2" color={item.done ? undefined : 'gray'}>
              <Flex align="center" gap="2">
                <Checkbox checked={item.done} disabled color="teal" />
                {t(`overview.completion.items.${item.key}`)}
              </Flex>
            </Text>
          ))}
        </Flex>
        <Text size="2" color="gray">
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
            <Heading size="3">{t('overview.media.title')}</Heading>
            <Text size="2" color="gray">
              {media.length}
            </Text>
          </Flex>
          <Text size="2" color="teal">
            {t('overview.media.viewAll')}
          </Text>
        </Flex>
        <Grid columns="2" gap="2">
          {media.map((tile) => (
            <Card key={tile.caption}>
              <Flex align="center" justify="center" height="56px">
                <Text size="1" color="gray">
                  {tile.caption}
                </Text>
              </Flex>
            </Card>
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
        <Heading size="3">{t('overview.researchNotes.title')}</Heading>
        <Box px="3" py="5">
          <Text size="2" color="gray" align="center" as="div">
            {t('overview.researchNotes.empty')}
          </Text>
        </Box>
      </Flex>
    </Card>
  );
}

function Suggestions({ suggestions }: { suggestions: OverviewSuggestion[] }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="3">{t('overview.suggestions.title')}</Heading>
        <Flex direction="column">
          {suggestions.map((suggestion, i) => (
            <Box key={suggestion.text}>
              {i > 0 && <Separator size="4" my="3" />}
              <Text size="2" color="gray">
                {suggestion.text}
              </Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}
