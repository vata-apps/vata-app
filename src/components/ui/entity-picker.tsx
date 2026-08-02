/**
 * EntityPicker primitive — search-and-attach popover for an existing record,
 * with an optional "Create …" footer for the exceptional case.
 *
 * Built on `ui/popover` and `ui/search-input`. Data (what `items` to show,
 * debouncing, server search) stays a caller concern — this primitive only
 * owns the popover chrome, the search field, and result-row rendering.
 */
import * as React from 'react';

import { Avatar } from './avatar';
import * as styles from './entity-picker.css';
import { Popover } from './popover';
import { SearchInput } from './search-input';

export interface EntityPickerItem {
  id: string;
  /** Record name — person, source, place. */
  title: string;
  /** One dim line: e.g. life years, or a type/repository. */
  meta?: string;
  /** Initials for the row's avatar disc. */
  initials?: string;
}

export interface EntityPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Content rendered inside the trigger button (icon + label). */
  trigger: React.ReactNode;
  triggerClassName?: string;
  disabled?: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  clearLabel?: string;
  items: EntityPickerItem[];
  onSelect: (item: EntityPickerItem) => void;
  /** Line rendered under the list — e.g. a "N more hidden" or "no matches" message. */
  hint?: React.ReactNode;
  /** Omit to hide the create footer. */
  onCreate?: () => void;
  createLabel?: React.ReactNode;
  createIcon?: React.ReactNode;
  width?: number | string;
}

export function EntityPicker({
  open,
  onOpenChange,
  trigger,
  triggerClassName = '',
  disabled,
  query,
  onQueryChange,
  searchPlaceholder,
  clearLabel,
  items,
  onSelect,
  hint,
  onCreate,
  createLabel,
  createIcon,
  width = styles.DEFAULT_WIDTH,
}: EntityPickerProps): JSX.Element {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger className={triggerClassName} disabled={disabled}>
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align="start" positionMethod="fixed">
          <Popover.Popup
            className={styles.popup}
            style={width === styles.DEFAULT_WIDTH ? undefined : { width }}
          >
            <div className={styles.search}>
              <SearchInput
                autoFocus
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                onClear={() => onQueryChange('')}
                placeholder={searchPlaceholder}
                clearLabel={clearLabel}
              />
            </div>
            <div className={styles.list}>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.row}
                  onClick={() => onSelect(item)}
                >
                  <Avatar.Root size="sm" tone="brand" aria-hidden="true">
                    <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                  </Avatar.Root>
                  <span className={styles.rowBody}>
                    <span className={styles.rowTitle}>{item.title}</span>
                    {item.meta && <span className={styles.rowMeta}>{item.meta}</span>}
                  </span>
                </button>
              ))}
              {hint && <div className={styles.hint}>{hint}</div>}
            </div>
            {onCreate && (
              <div className={styles.foot}>
                <button type="button" className={styles.create} onClick={onCreate}>
                  {createIcon}
                  <span className={styles.createLabel}>{createLabel}</span>
                </button>
              </div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
