import { useId, type ReactNode } from 'react';
import { Flex, Spinner, Text } from '@radix-ui/themes';

import { Icon, type IconName } from '$components/icon';

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
 * Props accepted by {@link Dropzone}.
 */
export interface DropzoneProps {
  /** Visual state. Driven by the consumer. Defaults to `"idle"`. */
  state?: DropzoneState;

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
   * surfaces directly to end users.
   */
  formatName: string;

  /**
   * Localized prompt rendered in the idle state. Required so the
   * component does not own copy.
   */
  idleLabel: ReactNode;

  /** Localized name shown in selected / scanning / done states. */
  selectedName?: ReactNode;

  /** Optional localized help text rendered below the card. */
  hint?: ReactNode;

  /** Disables the dropzone (no click, no dialog). */
  disabled?: boolean;
}

const stateIcon: Record<Exclude<DropzoneState, 'scanning'>, IconName> = {
  idle: 'upload',
  selected: 'folder-open',
  done: 'download',
  error: 'x',
};

/** Border colour per state, expressed in Radix Themes scale tokens. */
const stateBorderColor: Record<DropzoneState, string> = {
  idle: 'var(--gray-a6)',
  selected: 'var(--accent-8)',
  scanning: 'var(--accent-8)',
  done: 'var(--green-8)',
  error: 'var(--red-8)',
};

/**
 * File picker styled as a drop zone. Clicking the card opens the
 * native Tauri file dialog. Drag-and-drop is intentionally out of
 * scope — Tauri 2's webview drag events are an OS-level concern; the
 * click path covers the same use case with a real native dialog.
 *
 * The component is a controlled visual: the `state` prop drives the
 * appearance; the consumer transitions through `idle → selected →
 * scanning → done | error` after acting on the picked file.
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

  async function handleClick(): Promise<void> {
    if (!interactive) return;
    try {
      // Lazy-load so non-Tauri contexts can render the component without
      // resolving the plugin entry point at module-init time.
      const { open } = await import('@tauri-apps/plugin-dialog');
      const path = await open({
        multiple: false,
        filters: [{ name: formatName, extensions: accept }],
      });
      if (!path) return;
      const name = path.split(/[/\\]/).pop() ?? path;
      await onFileSelected({ path, name });
    } catch (err) {
      console.error('[Dropzone] file dialog or onFileSelected failed:', err);
    }
  }

  const showSelectedName = state !== 'idle' && selectedName;

  const card = (
    <button
      type="button"
      aria-disabled={!interactive || undefined}
      aria-describedby={hintId}
      onClick={() => void handleClick()}
      disabled={!interactive}
      style={{
        display: 'block',
        width: '100%',
        background: 'var(--color-panel-solid)',
        border: `1px dashed ${stateBorderColor[state]}`,
        borderRadius: 'var(--radius-4)',
        padding: 'var(--space-6)',
        color: 'inherit',
        font: 'inherit',
        cursor: interactive ? 'pointer' : state === 'scanning' ? 'progress' : 'default',
        opacity: !interactive && state === 'idle' ? 0.6 : 1,
      }}
    >
      <Flex direction="column" align="center" justify="center" gap="2">
        {state === 'scanning' ? <Spinner size="3" /> : <Icon name={stateIcon[state]} size={24} />}
        <Text size="2" weight="medium">
          {showSelectedName ? selectedName : idleLabel}
        </Text>
      </Flex>
    </button>
  );

  if (!hint) return card;

  return (
    <Flex direction="column" gap="1">
      {card}
      <Text id={hintId} size="1" color="gray">
        {hint}
      </Text>
    </Flex>
  );
}
