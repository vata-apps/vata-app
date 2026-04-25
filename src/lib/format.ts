export function formatIsoDate(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '—';
  }
}
