export function toErrorMessage(err: unknown): string | null {
  if (err == null) return null;
  if (err instanceof Error) return err.message;
  return String(err);
}
