import type { Dispatch, SetStateAction } from 'react';
import { Toast } from '@base-ui/react/toast';

import { toErrorMessage } from './errors';

/**
 * App-wide toast manager — a module-level singleton so non-React code (the
 * QueryClient's `MutationCache`, the GEDCOM import flow) can raise a toast
 * without a hook. Mount `Toast.Provider`/`Toast.Viewport`
 * (`src/components/ui/toast.tsx`) once at the app root to render what it
 * queues.
 */
export const toastManager = Toast.createToastManager();

/** Raises an error toast, folding a caught value into its description via {@link toErrorMessage}. */
export function notifyError(title: string, err?: unknown): void {
  toastManager.add({
    type: 'error',
    title,
    description: toErrorMessage(err) ?? undefined,
  });
}

/**
 * Mutation options for a record panel's auto-save-on-edit `commitEdit`: on a
 * failed save, force its local `buffer` to re-seed from the last known-good
 * server value next render, rather than silently leaving the failed edit on
 * screen looking saved. Shared by every record panel's `commitEdit` mutate
 * call (Notes, Names, Events, Relations tabs) — see issue #247.
 *
 * `targetId` must be the row id the save was *for* (the page's `activeId` at
 * the moment `commitEdit` fired), not read fresh when the error arrives — by
 * the time an in-flight save rejects, the user may have already selected a
 * different row, whose own buffer has since been reseeded and is mid-edit.
 * The functional update only resets `bufferFor` if it still equals
 * `targetId`, so a failure on a row the user has since left alone doesn't
 * clobber an unrelated row's unsaved buffer.
 */
export function resetBufferOnError(
  setBufferFor: Dispatch<SetStateAction<string | null>>,
  targetId: string
): { onError: () => void } {
  return {
    onError: () => setBufferFor((current) => (current === targetId ? null : current)),
  };
}
