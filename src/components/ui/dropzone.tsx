import { useId, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { Icon, type IconName } from './icon';

/**
 * One of the visual states a Dropzone can be in. The consumer drives
 * the state — the Dropzone never transitions on its own beyond opening
 * the file picker.
 */
export type DropzoneState = 'idle' | 'selected' | 'scanning' | 'done' | 'error';

/**
 * Payload passed to {@link DropzoneProps.onFileSelected}. The path
 * matches what Tauri's `@tauri-apps/plugin-dialog#open` returns.
 */
export interface DropzoneFile {
  /** Absolute filesystem path. */
  path: string;
  /** File name with extension. */
  name: string;
}

/**
 * Recipe for the Dropzone outer card. State controls the colour
 * palette; the inner content layout is the same across states.
 */
const dropzoneRecipe = tv({
  base: [
    'flex w-full flex-col items-center justify-center gap-2',
    'rounded-lg border border-dashed bg-card px-6 py-8 text-center',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ],
  variants: {
    state: {
      idle: 'border-border hover:border-primary/40 cursor-pointer',
      selected: 'border-primary/60 bg-primary/5 cursor-pointer',
      scanning: 'border-primary/60 bg-primary/5 cursor-progress',
      done: 'border-success/60 bg-success/5',
      error: 'border-destructive/60 bg-destructive/5',
    },
  },
  defaultVariants: { state: 'idle' },
});

type DropzoneRecipeProps = VariantProps<typeof dropzoneRecipe>;

/**
 * Props accepted by {@link Dropzone}.
 */
export interface DropzoneProps {
  /** Visual state. Driven by the consumer. Defaults to `"idle"`. */
  state?: DropzoneRecipeProps['state'];

  /**
   * Called with the picked file once the user confirms the dialog.
   * Returns nothing — the consumer transitions the `state` prop to
   * reflect whatever happens next (scanning, done, error).
   */
  onFileSelected: (file: DropzoneFile) => void | Promise<void>;

  /**
   * File extensions accepted (without the leading dot), passed through
   * to Tauri's open() filters. Defaults to `['ged', 'gedcom']`.
   */
  accept?: string[];

  /**
   * Localized name for the file format shown in the native open-file
   * dialog (e.g. "GEDCOM"). Required because Tauri's filter label
   * surfaces directly to end users — a missing translation must never
   * fall back to English here.
   */
  formatName: string;

  /**
   * Localized prompt rendered in the idle state (e.g.,
   * "Drop a .ged file or click to browse"). Required so the wrapper
   * does not own copy.
   */
  idleLabel: ReactNode;

  /**
   * Localized name shown in selected / scanning / done states. Skipped
   * if not provided.
   */
  selectedName?: ReactNode;

  /**
   * Optional localized help text rendered below the card.
   */
  hint?: ReactNode;

  /** Disables the dropzone (no click, no dialog). */
  disabled?: boolean;
}

const stateIcon: Record<DropzoneState, IconName> = {
  idle: 'upload',
  selected: 'folder-open',
  scanning: 'upload',
  done: 'download',
  error: 'x',
};

/**
 * File picker styled as a drop zone. Clicking the card opens the
 * native Tauri file dialog. Drag-and-drop handling is intentionally
 * out of scope for v1 — Tauri 2's webview drag events are an OS-level
 * concern; the click path covers the same use case with a real native
 * dialog.
 *
 * The component is a controlled visual: the `state` prop drives the
 * appearance; the consumer transitions through `idle → selected →
 * scanning → done | error` after acting on the picked file.
 *
 * @example
 * <Dropzone
 *   state={state}
 *   onFileSelected={async (file) => {
 *     setSelected(file);
 *     setState('scanning');
 *     try {
 *       await scan(file);
 *       setState('done');
 *     } catch {
 *       setState('error');
 *     }
 *   }}
 *   idleLabel={t('import.dropzone.idle')}
 *   selectedName={selected?.name}
 *   hint={t('import.dropzone.hint')}
 * />
 */
export function Dropzone({
  state = 'idle',
  onFileSelected,
  accept = ['ged', 'gedcom'],
  formatName,
  idleLabel,
  selectedName,
  hint,
  disabled,
}: DropzoneProps): JSX.Element {
  const interactive = !disabled && (state === 'idle' || state === 'selected');
  const reactId = useId();
  const hintId = hint ? `dropzone-${reactId}-hint` : undefined;

  async function handleClick() {
    if (!interactive) return;
    try {
      // Lazy-load so non-Tauri test contexts (Storybook in Vitest browser
      // mode) can still render the wrapper without trying to resolve the
      // plugin entry point at module-init time.
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: false,
        filters: [{ name: formatName, extensions: accept }],
      });
      if (!selected) return;
      const path = selected as string;
      const name = path.split(/[/\\]/).pop() ?? path;
      await onFileSelected({ path, name });
    } catch (err) {
      // Surface to the dev console so the unhandled rejection isn't silent;
      // the consumer is expected to drive the `state` prop to `'error'` from
      // its own catch in onFileSelected when it needs user feedback.
      console.error('[Dropzone] file dialog or onFileSelected failed:', err);
    }
  }

  const iconName = stateIcon[state];
  const showSelectedName = state !== 'idle' && selectedName;

  const card = (
    <button
      type="button"
      aria-disabled={!interactive || undefined}
      aria-describedby={hintId}
      onClick={handleClick}
      disabled={!interactive}
      className={dropzoneRecipe({ state })}
    >
      <Icon name={iconName} size={24} />
      <span className="text-foreground text-sm font-medium">
        {showSelectedName ? selectedName : idleLabel}
      </span>
    </button>
  );

  if (!hint) {
    return card;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {card}
      <p id={hintId} className="text-muted-foreground text-xs">
        {hint}
      </p>
    </div>
  );
}
