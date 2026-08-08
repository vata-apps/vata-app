/**
 * The fields of one note record, rendered inside the shared record panel.
 *
 * "Rattachée à" is always static text, never a picker: which person/event/
 * relation a note is about is decided by which "add" action started the
 * draft (see `PersonNotesPage`), not editable afterward — same rule as
 * `relation-detail.tsx`'s "Type de lien".
 *
 * Purely presentational: the page owns the values and decides what a change
 * means (buffer a draft, or commit an edit on blur). The trailing action —
 * the draft footer or the inline delete — is injected as `footer`.
 */
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '../icon';
import { Field } from '../ui/field';
import { Switch } from '../ui/switch';
import { TextField } from '../ui/text-field';
import { Typography } from '../ui/typography';
import * as s from './note-detail.css';
import type { NoteForm } from './note-form';

/** What a note is about, resolved to display fields by the page — see the file doc comment. */
export interface NoteTargetInfo {
  icon: IconName;
  label: string;
  kind: string;
}

export interface NoteDetailProps {
  target: NoteTargetInfo;
  value: NoteForm;
  /** Records a keystroke — cheap, local, not yet persisted. */
  onChange: (patch: Partial<NoteForm>) => void;
  /** Called when an edit should be persisted: on blur for the text, immediately for the privacy switch. */
  onCommit: (patch?: Partial<NoteForm>) => void;
  /** Draft footer or inline delete, depending on whether the record exists. */
  footer: ReactNode;
}

export function NoteDetail({
  target,
  value,
  onChange,
  onCommit,
  footer,
}: NoteDetailProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const id = useId();

  const charCount = value.text.length;

  return (
    <div className={s.body}>
      <Field label={t('notesTab.fields.target')}>
        <div className={s.target}>
          <span className={s.targetIcon}>
            <Icon name={target.icon} size={14} />
          </span>
          <span className={s.targetBody}>
            <Typography className={s.targetLabel} size="sm" weight="medium">
              {target.label}
            </Typography>
            <Typography size="xs" tone="muted">
              {target.kind}
            </Typography>
          </span>
        </div>
      </Field>

      <Field label={t('notesTab.fields.content')} htmlFor={`${id}-text`}>
        <TextField
          id={`${id}-text`}
          multiline
          rows={8}
          value={value.text}
          placeholder={t('notesTab.fields.contentPlaceholder')}
          onChange={(event) => onChange({ text: event.target.value })}
          onBlur={() => onCommit()}
        />
        <Typography className={s.charCount}>
          {charCount === 0
            ? t('notesTab.fields.charCountEmpty')
            : t('notesTab.fields.charCount', { count: charCount })}
        </Typography>
      </Field>

      <div className={s.section}>
        <div className={s.privacyRow}>
          <div className={s.privacyText}>
            <Typography weight="semibold">{t('notesTab.fields.private')}</Typography>
            <Typography size="xs" tone="muted">
              {t('notesTab.fields.privateHint')}
            </Typography>
          </div>
          <Switch.Root
            checked={value.isPrivate}
            onCheckedChange={(checked) => {
              onChange({ isPrivate: checked });
              onCommit({ isPrivate: checked });
            }}
          >
            <Switch.Thumb />
          </Switch.Root>
        </div>
      </div>

      {footer}
    </div>
  );
}
