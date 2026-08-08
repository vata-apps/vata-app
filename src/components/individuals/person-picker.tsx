import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EntityPicker, type EntityPickerItem } from '$components/ui/entity-picker';
import { Icon } from '$components/icon';
import { useIndividualBrowseOrSearch } from '$hooks/useIndividualBrowseOrSearch';
import { formatNameSimple } from '$db-tree/names';
import {
  formatLifeYears,
  initialsFromDisplayName,
  personDisplayFields,
  splitDisplayName,
} from './person-display';
import type { Gender, IndividualWithDetails } from '$types/database';
import * as s from './person-editor.css';

const MAX_RESULTS = 8;

/** One person picked from the popover — either an existing individual or a brand-new one to create on save. */
export interface PersonPickerSelection {
  id?: string;
  createNew?: { givenNames?: string; surname?: string; gender?: Gender };
  displayName: string;
  /** Life-event years, carried through so a filled relation slot can show "b. 1960 – 2020" (existing people only). */
  bornYear?: number;
  deathYear?: number;
}

export interface PersonPickerProps {
  /** Text for the "+ Add …" trigger the picker renders when empty. */
  label: string;
  onSelect: (selection: PersonPickerSelection) => void;
  /** Individual ids to hide from search results (e.g. the person being edited, or people already picked elsewhere in this form). */
  excludeIds?: string[];
  /** Gender to seed a newly-created person with (e.g. 'M' for a father slot); left unset defaults to unknown. */
  newPersonGender?: Gender;
  disabled?: boolean;
  /** Overrides the default dashed-slot trigger style — e.g. a compact ghost button for a card's inline "add" action. */
  triggerClassName?: string;
}

/**
 * Search-existing-or-create-new person combobox, used by the Person editor's
 * Relations card to fill a father/mother/spouse/child slot. Wraps the shared
 * `ui/entity-picker` chrome; this component owns the actual data — debounced
 * DB search when typing, a browse list when not — and maps results into the
 * primitive's flat item shape.
 */
export function PersonPicker({
  label,
  onSelect,
  excludeIds,
  newPersonGender,
  disabled,
  triggerClassName,
}: PersonPickerProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { trimmedQuery, isTyping, debounceSettled, browseResults, searchResults, isFetching } =
    useIndividualBrowseOrSearch(query, { enabled: open });

  const excluded = new Set(excludeIds ?? []);
  function toDisplay(person: IndividualWithDetails): PersonPickerSelection & { id: string } {
    return { id: person.id, ...personDisplayFields(person, t) };
  }

  const matches = isTyping
    ? searchResults
    : [...browseResults].sort((a, b) =>
        formatNameSimple(a.primaryName).localeCompare(formatNameSimple(b.primaryName))
      );
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

  const items: EntityPickerItem[] = results.map((person) => ({
    id: person.id,
    title: person.displayName,
    meta: formatLifeYears(person.bornYear, person.deathYear),
    initials: initialsFromDisplayName(person.displayName),
  }));

  function handleItemSelect(item: EntityPickerItem): void {
    const person = results.find((candidate) => candidate.id === item.id);
    if (person) pick(person);
  }

  function handleCreate(): void {
    pick({
      createNew: { ...splitDisplayName(trimmedQuery), gender: newPersonGender },
      displayName: trimmedQuery,
    });
  }

  let hint: string | undefined;
  if (hiddenCount > 0) hint = t('personEditor.picker.moreHidden', { count: hiddenCount });
  else if (noMatches) hint = t('personEditor.picker.noMatches');

  return (
    <EntityPicker
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <>
          <Icon name="plus" size={14} />
          {label}
        </>
      }
      triggerClassName={triggerClassName ?? s.relslot}
      disabled={disabled}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={t('personEditor.picker.searchPlaceholder')}
      clearLabel={tCommon('filters.clearSearch')}
      items={items}
      onSelect={handleItemSelect}
      hint={hint}
      onCreate={isTyping ? handleCreate : undefined}
      createLabel={t('personEditor.picker.createNew', { name: trimmedQuery })}
      createIcon={<Icon name="plus" size={14} />}
    />
  );
}
