import type { TextProps } from "@mantine/core";
import { Text as MantineText } from "@mantine/core";

interface TableTextProps extends Omit<TextProps, "size"> {
  children: React.ReactNode;
  size?: TextProps["size"];
}

/**
 * Text component specifically designed for table cells.
 * Uses "sm" size by default, but can be overridden.
 *
 * @example
 * // Basic usage
 * <TableData.Text>Simple text</TableData.Text>
 *
 * @example
 * // With dimmed color and italic style
 * <TableData.Text c="dimmed" fs="italic">Unknown</TableData.Text>
 *
 * @example
 * // Override default size
 * <TableData.Text size="xs">Small text</TableData.Text>
 *
 * @example
 * // With custom styles
 * <TableData.Text style={{ whiteSpace: "normal" }}>Wrapped text</TableData.Text>
 */
export function Text({ children, size = "sm", ...props }: TableTextProps) {
  return (
    <MantineText size={size} {...props}>
      {children}
    </MantineText>
  );
}
