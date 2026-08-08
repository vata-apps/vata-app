/**
 * Picker for an event- or relation-scoped note's target: which of this
 * person's own events or relations the new note is about. Fires the
 * selection straight into a draft — there is no intermediate "confirm" step,
 * matching `PersonPicker`'s pick-and-submit flow in the Relations tab.
 *
 * Wraps the shared `ui/entity-picker` chrome; unlike `PersonPicker` there is
 * no server search — a person's own events/relations are already loaded by
 * the tab, so this only filters the given `items` client-side.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { initialsFromDisplayName } from '$components/individuals/person-display';
import { Icon } from '$components/icon';
import { EntityPicker, type EntityPickerItem } from '$components/ui/entity-picker';

export interface NoteTargetOption {
  id: string;
  title: string;
  meta?: string;
}

export interface NoteTargetPickerProps {
  /** Text for the "+ Add …" trigger. */
  label: string;
  options: NoteTargetOption[];
  onSelect: (option: NoteTargetOption) => void;
  triggerClassName?: string;
}

export function NoteTargetPicker({
  label,
  options,
  onSelect,
  triggerClassName,
}: NoteTargetPickerProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  function handleOpenChange(next: boolean): void {
    setOpen(next);
    if (!next) setQuery('');
  }

  const trimmedQuery = query.trim().toLowerCase();
  const filtered = trimmedQuery
    ? options.filter((option) => option.title.toLowerCase().includes(trimmedQuery))
    : options;

  const items: EntityPickerItem[] = filtered.map((option) => ({
    id: option.id,
    title: option.title,
    meta: option.meta,
    initials: initialsFromDisplayName(option.title),
  }));

  function handleItemSelect(item: EntityPickerItem): void {
    const option = filtered.find((candidate) => candidate.id === item.id);
    if (option) {
      onSelect(option);
      handleOpenChange(false);
    }
  }

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
      triggerClassName={triggerClassName}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={t('personEditor.picker.searchPlaceholder')}
      clearLabel={tCommon('filters.clearSearch')}
      items={items}
      onSelect={handleItemSelect}
      hint={items.length === 0 ? t('notesTab.picker.noItems') : undefined}
    />
  );
}
