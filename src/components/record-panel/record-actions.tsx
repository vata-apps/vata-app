/**
 * The two trailing actions every record detail shares: the draft footer that
 * commits a new record, and the two-step inline delete that removes an
 * existing one.
 *
 * Both stay inside the detail body — the screen never opens a modal to confirm
 * a record-level action, so the list beside it remains readable while the user
 * decides.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../ui/button';
import { Icon } from '../icon';
import { Typography } from '../ui/typography';
import * as s from './record-actions.css';

/**
 * An `InlineDelete` question, with a "will also delete N notes" suffix key
 * swapped in when the record has attached notes riding along via its
 * `notes.event_id`/`family_member_id` `ON DELETE CASCADE`. `baseKey` must
 * have a `${baseKey}WithNotes` sibling key (`_one`/`_other`) alongside it.
 */
export function deleteQuestionWithNoteCount(
  t: (key: string, options?: Record<string, unknown>) => string,
  baseKey: string,
  params: Record<string, unknown>,
  noteCount: number
): string {
  return noteCount > 0
    ? t(`${baseKey}WithNotes`, { ...params, count: noteCount })
    : t(baseKey, params);
}

/**
 * Footer of a draft record: a "not saved" marker, cancel, and create. Create
 * stays disabled until the entity's required field is filled, which the caller
 * decides through `canCreate` — the primitive has no opinion on which field
 * that is.
 */
export function DraftFooter({
  createLabel,
  canCreate,
  isCreating = false,
  onCancel,
  onCreate,
}: {
  /** Entity-specific call to action, e.g. "Create name". */
  createLabel: string;
  canCreate: boolean;
  isCreating?: boolean;
  onCancel: () => void;
  onCreate: () => void;
}): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <div className={s.draftFooter}>
      <Typography className={s.draftStatus} size="xs" tone="muted">
        {t('records.notSaved')}
      </Typography>
      <Button variant="ghost" onClick={onCancel} disabled={isCreating}>
        {t('records.cancel')}
      </Button>
      <Button onClick={onCreate} disabled={!canCreate || isCreating}>
        {createLabel}
      </Button>
    </div>
  );
}

/**
 * Delete control that turns into its own confirmation bar in place. The
 * confirmation resets whenever the caller remounts it with a new `key`, which
 * is how switching records drops a half-armed delete.
 */
export function InlineDelete({
  triggerLabel,
  question,
  isDeleting = false,
  onDelete,
}: {
  /** Entity-specific trigger, e.g. "Delete this name". */
  triggerLabel: string;
  /** Entity-specific confirmation question naming the record. */
  question: string;
  isDeleting?: boolean;
  onDelete: () => void;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={s.deleteSection}>
      {confirming ? (
        <div className={s.confirmBar}>
          <Typography className={s.confirmQuestion} size="xs">
            {question}
          </Typography>
          <Button variant="ghost" onClick={() => setConfirming(false)} disabled={isDeleting}>
            {t('records.cancel')}
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={isDeleting}>
            {t('records.delete')}
          </Button>
        </div>
      ) : (
        <Button variant="ghost" className={s.deleteTrigger} onClick={() => setConfirming(true)}>
          <Icon name="trash" size={14} />
          {triggerLabel}
        </Button>
      )}
    </div>
  );
}
