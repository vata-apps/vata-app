import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover } from '@base-ui/react/popover';

import { Icon } from '$components/icon';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { useIndividualSearch, useIndividuals } from '$hooks/useIndividuals';
import { formatNameSimple } from '$db-tree/names';
import { formatLifeYears, initialsFromDisplayName, personDisplayFields } from './person-display';
import type { Gender, IndividualWithDetails } from '$types/database';
import * as s from './person-editor.css';

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
  /** Text for the dashed "+ Add …" trigger the picker renders when empty. */
  label: string;
  onSelect: (selection: PersonPickerSelection) => void;
  /** Individual ids to hide from search results (e.g. the person being edited, or people already picked elsewhere in this form). */
  excludeIds?: string[];
  /** Gender to seed a newly-created person with (e.g. 'M' for a father slot); left unset defaults to unknown. */
  newPersonGender?: Gender;
  disabled?: boolean;
}

/**
 * Search-existing-or-create-new person combobox, used by the Person editor's
 * Relations card to fill a father/mother/spouse/child slot. Base UI `Popover`
 * over a plain search input and button list (no combobox atom needed), styled
 * from the warm-earth tokens.
 */
export function PersonPicker({
  label,
  onSelect,
  excludeIds,
  newPersonGender,
  disabled,
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
      <Popover.Trigger className={s.relslot} disabled={disabled}>
        <Icon name="plus" size={14} />
        {label}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          sideOffset={6}
          align="start"
          positionMethod="fixed"
          className={s.positionerZ}
        >
          <Popover.Popup className={s.pickerPopup}>
            <input
              className={s.input}
              autoFocus
              placeholder={t('personEditor.picker.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className={s.pickerList}>
              {results.map((person) => {
                const dates = formatLifeYears(person.bornYear, person.deathYear);
                return (
                  <button
                    key={person.id}
                    type="button"
                    className={s.pickerItem}
                    onClick={() => pick(person)}
                  >
                    <span className={s.pfieldAvatar} aria-hidden="true">
                      {initialsFromDisplayName(person.displayName)}
                    </span>
                    <span className={s.pfieldBody}>
                      <span className={s.pfieldName}>{person.displayName}</span>
                      {dates && <span className={s.pfieldDates}>{dates}</span>}
                    </span>
                  </button>
                );
              })}
              {hiddenCount > 0 && (
                <div className={s.pickerMeta}>
                  {t('personEditor.picker.moreHidden', { count: hiddenCount })}
                </div>
              )}
              {noMatches && (
                <div className={s.pickerMeta}>{t('personEditor.picker.noMatches')}</div>
              )}
            </div>
            {isTyping && (
              <button
                type="button"
                className={s.pickerCreate}
                onClick={() =>
                  pick({
                    createNew: { ...splitDisplayName(trimmedQuery), gender: newPersonGender },
                    displayName: trimmedQuery,
                  })
                }
              >
                <Icon name="plus" size={14} />
                {t('personEditor.picker.createNew', { name: trimmedQuery })}
              </button>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
