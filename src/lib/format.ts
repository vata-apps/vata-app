export function formatIsoDate(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '—';
  }
}

const KB = 1024;
const MB = 1024 * 1024;

/**
 * Format a byte count for human display (e.g., `12 B`, `1.4 KB`,
 * `2.3 MB`). One decimal place above 1 KB.
 */
export function formatBytes(bytes: number): string {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}
