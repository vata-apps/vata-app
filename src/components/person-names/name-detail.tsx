/**
 * The fields of one name record, rendered inside the shared record panel.
 *
 * The mockup edits a name as a single "full name" string; the `names` table
 * stores its parts separately (prefix, given names, surname, suffix,
 * nickname), so this follows the schema and gives each part its own control.
 *
 * Purely presentational: the page above owns the values and decides what a
 * change means (buffer a draft, or commit an edit on blur). The trailing
 * action — the draft footer or the inline delete — is injected as `footer` so
 * this component stays free of mutation concerns.
 *
 * Field ids come from `useId` because this body is mounted twice at once (once
 * inline under the row, once in the side panel); a shared literal id would
 * make both labels point at the same control.
 */
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Field } from '../ui/field';
import { Icon } from '../icon';
import { RecordSources, type RecordSourcesProps } from '../record-panel/record-sources';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { TextField } from '../ui/text-field';
import { Typography } from '../ui/typography';
import * as s from './name-detail.css';
import { NAME_TYPES } from '$db-tree/names';
import type { NameType } from '$types/database';
import { type NameForm } from './name-form';

/** Props for the read-only Sources section. Omitted entirely for a draft. */
export type NameDetailSources = Omit<RecordSourcesProps, 'title'>;

export interface NameDetailProps {
  value: NameForm;
  /** Records a keystroke — cheap, local, not yet persisted. */
  onChange: (patch: Partial<NameForm>) => void;
  /**
   * Called when an edit should be persisted: on blur for text fields, and
   * immediately for the type select. Controls that commit in the same tick as
   * their `onChange` pass their `patch` again, because the buffered `value`
   * has not been re-rendered yet at that point.
   */
  onCommit: (patch?: Partial<NameForm>) => void;
  /**
   * Toggling "primary" is exclusive across the person's names, so it is never
   * buffered — the page applies it immediately.
   */
  onPrimaryChange: (isPrimary: boolean) => void;
  /** Draft footer or inline delete, depending on whether the record exists. */
  footer: ReactNode;
  /** Omit for a draft — nothing can cite a record that does not exist yet. */
  sources?: NameDetailSources;
}

export function NameDetail({
  value,
  onChange,
  onCommit,
  onPrimaryChange,
  footer,
  sources,
}: NameDetailProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const id = useId();

  return (
    <div className={s.body}>
      <Field label={t('namesTab.fields.type')} htmlFor={`${id}-type`}>
        <Select.Root
          value={value.type}
          onValueChange={(next) => {
            // Base UI allows clearing a select; this one is always required.
            if (next === null) return;
            onChange({ type: next });
            onCommit({ type: next });
          }}
        >
          <Select.Trigger id={`${id}-type`}>
            <Select.Value>
              {(selected) => (selected ? t(`overview.names.types.${selected as NameType}`) : '')}
            </Select.Value>
            <Select.Icon>
              <Icon name="chevron-down" size={14} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={4}>
              <Select.Popup>
                {NAME_TYPES.map((type) => (
                  <Select.Item key={type} value={type}>
                    <Select.ItemText>{t(`overview.names.types.${type}`)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Field>

      <div className={s.nameParts}>
        <Field label={t('namesTab.fields.givenNames')} htmlFor={`${id}-given`}>
          <TextField
            id={`${id}-given`}
            value={value.givenNames}
            onChange={(event) => onChange({ givenNames: event.target.value })}
            onBlur={() => onCommit()}
          />
        </Field>
        <Field label={t('namesTab.fields.surname')} htmlFor={`${id}-surname`}>
          <TextField
            id={`${id}-surname`}
            value={value.surname}
            onChange={(event) => onChange({ surname: event.target.value })}
            onBlur={() => onCommit()}
          />
        </Field>
      </div>

      <div className={s.affixes}>
        <Field label={t('namesTab.fields.prefix')} htmlFor={`${id}-prefix`}>
          <TextField
            id={`${id}-prefix`}
            value={value.prefix}
            onChange={(event) => onChange({ prefix: event.target.value })}
            onBlur={() => onCommit()}
          />
        </Field>
        <Field label={t('namesTab.fields.suffix')} htmlFor={`${id}-suffix`}>
          <TextField
            id={`${id}-suffix`}
            value={value.suffix}
            onChange={(event) => onChange({ suffix: event.target.value })}
            onBlur={() => onCommit()}
          />
        </Field>
        <Field label={t('namesTab.fields.nickname')} htmlFor={`${id}-nickname`}>
          <TextField
            id={`${id}-nickname`}
            value={value.nickname}
            onChange={(event) => onChange({ nickname: event.target.value })}
            onBlur={() => onCommit()}
          />
        </Field>
      </div>

      <div className={s.primaryRow}>
        <span className={s.primaryText}>
          <Typography weight="semibold">{t('namesTab.primary.label')}</Typography>
          <Typography size="xs" tone="muted">
            {t('namesTab.primary.hint')}
          </Typography>
        </span>
        <Switch.Root
          checked={value.isPrimary}
          // Primary is exclusive, so it can only ever be turned on here; the
          // way to clear it is to promote another name.
          disabled={value.isPrimary}
          onCheckedChange={onPrimaryChange}
          aria-label={t('namesTab.primary.label')}
        >
          <Switch.Thumb />
        </Switch.Root>
      </div>

      {sources ? <RecordSources title={t('namesTab.sources.title')} {...sources} /> : null}

      {footer}
    </div>
  );
}
