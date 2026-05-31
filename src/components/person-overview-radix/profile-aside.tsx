import React from 'react';

import {
  Box,
  Button,
  Card,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
} from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { OverviewResearchNote, OverviewSuggestion, SuggestionKind } from './overview-mock';
import { Icon } from '../icon';

interface ProfileAsideProps {
  researchNotes: OverviewResearchNote[];
  suggestions: OverviewSuggestion[];
}

/**
 * The right aside: a research-notes panel and research suggestions, stacked.
 * Pure `@radix-ui/themes`: `Separator`-divided rows for notes and suggestions.
 */
export function ProfileAside({ researchNotes, suggestions }: ProfileAsideProps): JSX.Element {
  return (
    <Flex direction="column" gap="4">
      <ResearchNotes notes={researchNotes} />
      <Suggestions suggestions={suggestions} />
    </Flex>
  );
}

const NOTES_VISIBLE = 2;

function ResearchNotes({ notes }: { notes: OverviewResearchNote[] }): JSX.Element {
  const { t } = useTranslation('individuals');
  const visible = notes.slice(0, NOTES_VISIBLE);
  const remaining = notes.length - NOTES_VISIBLE;

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="4">{t('overview.researchNotes.title')}</Heading>
        {notes.length === 0 ? (
          <Box px="3" py="5">
            <Text size="2" color="gray" align="center" as="div">
              {t('overview.researchNotes.empty')}
            </Text>
          </Box>
        ) : (
          <Flex direction="column">
            {visible.map((note, i) => (
              <React.Fragment key={note.id}>
                {i > 0 && <Separator size="4" my="3" />}
                <Flex gap="2" align="start">
                  <Flex direction="column" gap="1" flexGrow="1" style={{ minWidth: 0 }}>
                    <Text size="1" color="gray">
                      {note.date}
                    </Text>
                    <Text
                      size="2"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {note.text}
                    </Text>
                  </Flex>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton size="1" variant="ghost" color="gray" style={{ flexShrink: 0 }}>
                        <Icon name="ellipsis-vertical" size={14} />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content size="1" align="end">
                      <DropdownMenu.Item>{t('overview.researchNotes.markDone')}</DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item color="red">
                        {t('overview.researchNotes.delete')}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Flex>
              </React.Fragment>
            ))}
            {remaining > 0 && (
              <>
                <Separator size="4" my="3" />
                <Text size="2" color="gray">
                  {t('overview.researchNotes.more', { count: remaining })}
                </Text>
              </>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

const kindConfig: Record<
  SuggestionKind,
  { icon: 'users' | 'triangle-alert' | 'sparkles'; color: 'amber' | 'orange' | 'indigo' }
> = {
  duplicate: { icon: 'users', color: 'amber' },
  conflict: { icon: 'triangle-alert', color: 'orange' },
  hint: { icon: 'sparkles', color: 'indigo' },
};

const SUGGESTIONS_VISIBLE = 2;

function Suggestions({ suggestions }: { suggestions: OverviewSuggestion[] }): JSX.Element {
  const { t } = useTranslation('individuals');
  const visible = suggestions.slice(0, SUGGESTIONS_VISIBLE);
  const remaining = suggestions.length - SUGGESTIONS_VISIBLE;

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="4">{t('overview.suggestions.title')}</Heading>
        {suggestions.length === 0 ? (
          <Box px="3" py="5">
            <Text size="2" color="gray" align="center" as="div">
              {t('overview.suggestions.empty')}
            </Text>
          </Box>
        ) : (
          <Flex direction="column">
            {visible.map((suggestion, i) => {
              const { icon, color } = kindConfig[suggestion.kind];
              return (
                <React.Fragment key={suggestion.id}>
                  {i > 0 && <Separator size="4" my="3" />}
                  <Flex gap="3" align="start">
                    <Flex
                      align="center"
                      justify="center"
                      flexShrink="0"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--radius-2)',
                        background: `var(--${color}-3)`,
                        color: `var(--${color}-11)`,
                      }}
                    >
                      <Icon name={icon} size={14} />
                    </Flex>
                    <Flex direction="column" gap="2" flexGrow="1">
                      <Text size="2">{suggestion.text}</Text>
                      <Box>
                        <Button size="1" variant="soft" color={color}>
                          {suggestion.action}
                        </Button>
                      </Box>
                    </Flex>
                  </Flex>
                </React.Fragment>
              );
            })}
            {remaining > 0 && (
              <>
                <Separator size="4" my="3" />
                <Text size="2" color="gray">
                  {t('overview.suggestions.more', { count: remaining })}
                </Text>
              </>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
