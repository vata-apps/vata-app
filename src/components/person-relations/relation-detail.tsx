/**
 * The fields of one relation record, rendered inside the shared record panel.
 *
 * "Type de lien" is always static text, never a select: which slot a relation
 * fills (father vs. mother, sibling, spouse, child) is decided by which "add"
 * picker the user opened, not editable afterward — changing it would mean
 * moving the person to a different `family_members` role, a structural
 * operation this tab does not offer (remove, then add through the right
 * picker, instead).
 *
 * Purely presentational: the page owns the values and decides what a change
 * means (buffer a draft, or commit an edit on blur). The trailing action —
 * the draft footer or the inline delete — is injected as `footer`.
 */
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '../icon';
import { RecordSources, type RecordSourcesProps } from '../record-panel/record-sources';
import { Field } from '../ui/field';
import { Select } from '../ui/select';
import { TextField } from '../ui/text-field';
import { Typography } from '../ui/typography';
import * as s from './relation-detail.css';
import { CERTAINTY_OPTIONS, type RelationDetailsForm } from './relation-form';
import type { RelationCertainty, RelationNature } from '$types/database';

/** Props for the read-only Sources section. Omitted entirely for a draft. */
export type RelationDetailSources = Omit<RecordSourcesProps, 'title'>;

export interface RelationDetailProps {
  /** The relation's own translated label, e.g. "Père", "Demi-sœur", "Épouse" — static, see the file doc comment. */
  relationLabel: string;
  /** `nature` values valid for this row's kind — a spouse can't be "biological", a child can't be "married". */
  natureOptions: RelationNature[];
  value: RelationDetailsForm;
  /** Records a keystroke — cheap, local, not yet persisted. */
  onChange: (patch: Partial<RelationDetailsForm>) => void;
  /** Called when an edit should be persisted: on blur for the note, immediately for the selects. */
  onCommit: (patch?: Partial<RelationDetailsForm>) => void;
  /** Omit for a draft — nothing can cite a record that does not exist yet. */
  sources?: RelationDetailSources;
  /** Draft footer or inline delete, depending on whether the record exists. */
  footer: ReactNode;
}

/** A `nature`/`certainty`-shaped select: an enum value with an "unset" state, each option resolved through `relationsTab.fields.<i18nKey>.<value>`. */
function RelationSelect<Value extends string>({
  id,
  i18nKey,
  unsetKey,
  options,
  value,
  onValueChange,
}: {
  id: string;
  i18nKey: 'natureOptions' | 'certaintyOptions';
  unsetKey: 'natureUnset' | 'certaintyUnset';
  options: readonly Value[];
  value: Value | '';
  onValueChange: (next: Value | '') => void;
}): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Select.Root
      value={value === '' ? null : value}
      onValueChange={(next) => onValueChange((next ?? '') as Value | '')}
    >
      <Select.Trigger id={id}>
        <Select.Value>
          {(selected) =>
            selected
              ? t(`relationsTab.fields.${i18nKey}.${selected as Value}`)
              : t(`relationsTab.fields.${unsetKey}`)
          }
        </Select.Value>
        <Select.Icon>
          <Icon name="chevron-down" size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4}>
          <Select.Popup>
            {options.map((option) => (
              <Select.Item key={option} value={option}>
                <Select.ItemText>{t(`relationsTab.fields.${i18nKey}.${option}`)}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

export function RelationDetail({
  relationLabel,
  natureOptions,
  value,
  onChange,
  onCommit,
  sources,
  footer,
}: RelationDetailProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const id = useId();

  return (
    <div className={s.body}>
      <div className={s.typeAndNature}>
        <Field label={t('relationsTab.fields.type')}>
          <div className={s.typeStatic}>
            <Typography>{relationLabel}</Typography>
          </div>
        </Field>

        <Field label={t('relationsTab.fields.nature')} htmlFor={`${id}-nature`}>
          <RelationSelect
            id={`${id}-nature`}
            i18nKey="natureOptions"
            unsetKey="natureUnset"
            options={natureOptions}
            value={value.nature}
            onValueChange={(nature: RelationNature | '') => {
              onChange({ nature });
              onCommit({ nature });
            }}
          />
        </Field>
      </div>

      <Field label={t('relationsTab.fields.certainty')} htmlFor={`${id}-certainty`}>
        <RelationSelect
          id={`${id}-certainty`}
          i18nKey="certaintyOptions"
          unsetKey="certaintyUnset"
          options={CERTAINTY_OPTIONS}
          value={value.certainty}
          onValueChange={(certainty: RelationCertainty | '') => {
            onChange({ certainty });
            onCommit({ certainty });
          }}
        />
      </Field>

      {sources ? <RecordSources title={t('relationsTab.sources.title')} {...sources} /> : null}

      <Field label={t('relationsTab.fields.note')} htmlFor={`${id}-note`}>
        <TextField
          id={`${id}-note`}
          multiline
          value={value.note}
          onChange={(event) => onChange({ note: event.target.value })}
          onBlur={() => onCommit()}
        />
      </Field>

      {footer}
    </div>
  );
}
