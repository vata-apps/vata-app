/**
 * Search-existing-or-create-new person picker for the Events tab's
 * participants section. Wraps the shared `ui/entity-picker`, adding a
 * Récents/Toutes les personnes tab switch (via `EntityPicker`'s `header`
 * slot) shown while the user isn't typing — "Récents" reads the current
 * tree's recently-picked participants from the app store, "Toutes" browses
 * every individual, and typing switches both to a debounced name search via
 * the shared `useIndividualBrowseOrSearch` hook (also used by `PersonPicker`).
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { personDisplayFields, splitDisplayName } from '$components/individuals/person-display';
import { button } from '$components/ui/button.css';
import { EntityPicker, type EntityPickerItem } from '$components/ui/entity-picker';
import { SegmentedControl } from '$components/ui/segmented-control';
import { formatNameSimple } from '$db-tree/names';
import { useIndividualBrowseOrSearch } from '$hooks/useIndividualBrowseOrSearch';
import { formatLifeYears, initialsFromDisplayName } from '$lib/personSummary';
import { useRecentEventParticipantIds } from '$/store/app-store';
import type { IndividualWithDetails } from '$types/database';

const MAX_RESULTS = 8;

/** One person picked from the popover — either an existing individual or a brand-new one to create. */
export interface EventParticipantSelection {
  id?: string;
  createNew?: { givenNames?: string; surname?: string };
  displayName: string;
  bornYear?: number;
  deathYear?: number;
}

export interface EventParticipantPickerProps {
  onSelect: (selection: EventParticipantSelection) => void;
  /** Individual ids to hide from results — the tab's own person plus everyone already added. */
  excludeIds: string[];
  disabled?: boolean;
}

type BrowseTab = 'recent' | 'all';

export function EventParticipantPicker({
  onSelect,
  excludeIds,
  disabled,
}: EventParticipantPickerProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<BrowseTab>('recent');
  const recentIds = useRecentEventParticipantIds();

  const { trimmedQuery, isTyping, debounceSettled, browseResults, searchResults, isFetching } =
    useIndividualBrowseOrSearch(query, { enabled: open });

  const excluded = new Set(excludeIds);
  function toDisplay(person: IndividualWithDetails): EventParticipantSelection & { id: string } {
    return { id: person.id, ...personDisplayFields(person, t) };
  }

  let matches: IndividualWithDetails[];
  if (isTyping) {
    matches = searchResults;
  } else if (tab === 'recent') {
    const byId = new Map(browseResults.map((person) => [person.id, person]));
    matches = recentIds
      .map((id) => byId.get(id))
      .filter((person): person is IndividualWithDetails => person !== undefined);
  } else {
    matches = [...browseResults].sort((a, b) =>
      formatNameSimple(a.primaryName).localeCompare(formatNameSimple(b.primaryName))
    );
  }

  const filtered = matches.filter((person) => !excluded.has(person.id)).map(toDisplay);
  const results = filtered.slice(0, MAX_RESULTS);
  const hiddenCount = filtered.length - results.length;
  const noMatches = results.length === 0 && !isFetching && (!isTyping || debounceSettled);

  function handleOpenChange(next: boolean): void {
    setOpen(next);
    if (!next) {
      setQuery('');
      setTab('recent');
    }
  }

  function pick(selection: EventParticipantSelection): void {
    onSelect(selection);
    handleOpenChange(false);
  }

  const items: EntityPickerItem[] = results.map((person) => ({
    id: person.id,
    title: person.displayName,
    meta: formatLifeYears(person, t),
    initials: initialsFromDisplayName(person.displayName),
  }));

  function handleItemSelect(item: EntityPickerItem): void {
    const person = results.find((candidate) => candidate.id === item.id);
    if (person) pick(person);
  }

  function handleCreate(): void {
    pick({ createNew: splitDisplayName(trimmedQuery), displayName: trimmedQuery });
  }

  let hint: string | undefined;
  if (hiddenCount > 0) hint = t('personEditor.picker.moreHidden', { count: hiddenCount });
  else if (noMatches) hint = t('personEditor.picker.noMatches');
  else if (tab === 'recent' && !isTyping && results.length === 0)
    hint = t('eventsTab.participants.noRecents');

  const header = !isTyping ? (
    <SegmentedControl
      aria-label={t('eventsTab.participants.browseLabel')}
      value={tab}
      onValueChange={setTab}
      options={[
        { value: 'recent', label: t('eventsTab.participants.recent') },
        { value: 'all', label: t('eventsTab.participants.all') },
      ]}
    />
  ) : undefined;

  return (
    <EntityPicker
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <>
          <Icon name="plus" size={14} />
          {t('eventsTab.participants.add')}
        </>
      }
      triggerClassName={button({ variant: 'ghost' })}
      disabled={disabled}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={t('personEditor.picker.searchPlaceholder')}
      clearLabel={tCommon('filters.clearSearch')}
      header={header}
      items={items}
      onSelect={handleItemSelect}
      hint={hint}
      onCreate={isTyping ? handleCreate : undefined}
      createLabel={t('personEditor.picker.createNew', { name: trimmedQuery })}
      createIcon={<Icon name="plus" size={14} />}
    />
  );
}
