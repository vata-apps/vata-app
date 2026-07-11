import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Button, Flex, Popover, Text, TextField } from '@radix-ui/themes';

import { Icon } from '$components/icon';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { useIndividualSearch, useIndividuals } from '$hooks/useIndividuals';
import { formatNameSimple } from '$db-tree/names';
import { formatLifeYears, initialsFromDisplayName, personDisplayFields } from './person-display';
import type { Gender, IndividualWithDetails } from '$types/database';

const MAX_RESULTS = 8;
const SEARCH_DEBOUNCE_MS = 200;

/** One person picked from the popover — either an existing individual or a brand-new one to create on save. */
export interface PersonPickerSelection {
  id?: string;
  createNew?: { givenNames?: string; surname?: string; gender?: Gender };
  displayName: string;
  /** Life-event years, carried through so a filled relation slot can show "b. 1960 – 2020" (existing people only). */
  bornYear?: number;
  deathYear?: number;
}

/** Splits free-typed text into given names + surname: the last word is the surname, everything before it the given names — a single word has no surname. */
function splitDisplayName(name: string): { givenNames?: string; surname?: string } {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { givenNames: words[0] };
  return { givenNames: words.slice(0, -1).join(' '), surname: words[words.length - 1] };
}

export interface PersonPickerProps {
  /** The trigger element wrapped by `Popover.Trigger` (typically a dashed "+ Add …" button). */
  children: ReactNode;
  onSelect: (selection: PersonPickerSelection) => void;
  /** Individual ids to hide from search results (e.g. the person being edited, or people already picked elsewhere in this form). */
  excludeIds?: string[];
  /** Gender to seed a newly-created person with (e.g. 'M' for a father slot); left unset defaults to unknown. */
  newPersonGender?: Gender;
}

/**
 * Search-existing-or-create-new person combobox, used by the Person editor's
 * Relations card to fill a father/mother/spouse/child slot. Composes
 * `Popover` + `TextField` + a plain button list (Radix Themes has no
 * combobox primitive) — see design-system-standards for why this stays a
 * composition rather than a new visual atom.
 */
export function PersonPicker({
  children,
  onSelect,
  excludeIds,
  newPersonGender,
}: PersonPickerProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim();
  const isTyping = trimmedQuery.length > 0;
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const debounceSettled = debouncedQuery === trimmedQuery;

  // Nothing typed yet: browse the existing people already in the tree.
  // Once typing starts, switch to a (debounced) name search.
  const defaultListQuery = useIndividuals({ enabled: open && !isTyping });
  const searchQuery = useIndividualSearch(debouncedQuery, {
    enabled: open && debouncedQuery.length > 0,
  });

  const excluded = new Set(excludeIds ?? []);
  function toDisplay(person: IndividualWithDetails): PersonPickerSelection & { id: string } {
    return { id: person.id, ...personDisplayFields(person, t) };
  }

  const matches = isTyping
    ? (searchQuery.data ?? [])
    : [...(defaultListQuery.data ?? [])].sort((a, b) =>
        formatNameSimple(a.primaryName).localeCompare(formatNameSimple(b.primaryName))
      );
  const isFetching = isTyping ? searchQuery.isFetching : defaultListQuery.isFetching;
  const filtered = matches.filter((person) => !excluded.has(person.id)).map(toDisplay);
  const results = filtered.slice(0, MAX_RESULTS);
  const hiddenCount = filtered.length - results.length;
  const noMatches = results.length === 0 && !isFetching && (!isTyping || debounceSettled);

  function handleOpenChange(next: boolean): void {
    setOpen(next);
    if (!next) setQuery('');
  }

  function pick(selection: PersonPickerSelection): void {
    onSelect(selection);
    handleOpenChange(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content width="280px">
        <Flex direction="column" gap="2">
          <TextField.Root
            autoFocus
            placeholder={t('personEditor.picker.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Flex direction="column" gap="1">
            {results.map((person) => {
              const dates = formatLifeYears(person.bornYear, person.deathYear);
              return (
                <Button
                  key={person.id}
                  type="button"
                  variant="ghost"
                  color="gray"
                  onClick={() => pick(person)}
                >
                  <Flex align="center" gap="2" width="100%">
                    <span aria-hidden="true">
                      <Avatar
                        size="2"
                        radius="full"
                        fallback={initialsFromDisplayName(person.displayName)}
                      />
                    </span>
                    <Flex direction="column" align="start" overflow="hidden">
                      <Text truncate>{person.displayName}</Text>
                      {dates && (
                        <Text size="1" color="gray">
                          {dates}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Button>
              );
            })}
            {hiddenCount > 0 && (
              <Box py="1">
                <Text size="1" color="gray">
                  {t('personEditor.picker.moreHidden', { count: hiddenCount })}
                </Text>
              </Box>
            )}
            {noMatches && (
              <Box py="1">
                <Text size="1" color="gray">
                  {t('personEditor.picker.noMatches')}
                </Text>
              </Box>
            )}
            {isTyping && (
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={() =>
                  pick({
                    createNew: { ...splitDisplayName(trimmedQuery), gender: newPersonGender },
                    displayName: trimmedQuery,
                  })
                }
              >
                <Flex align="center" gap="2" width="100%">
                  <Icon name="plus" />
                  <Text truncate>{t('personEditor.picker.createNew', { name: trimmedQuery })}</Text>
                </Flex>
              </Button>
            )}
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
