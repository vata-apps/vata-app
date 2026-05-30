import { Text } from '@radix-ui/themes';

/**
 * The shared inner-surface treatment used by the overview's figure strip,
 * media tiles, and place legend rows — a faint raised panel on the page.
 */
export const PANEL_SURFACE: React.CSSProperties = {
  background: 'var(--gray-3)',
  border: '1px solid var(--gray-a5)',
  borderRadius: 'var(--radius-3)',
};

/** The accent section title shared by the overview panels. */
export function PanelTitle({
  size = '3',
  children,
}: {
  size?: '3' | '4';
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Text size={size} weight="medium" style={{ color: 'var(--accent-11)' }}>
      {children}
    </Text>
  );
}
