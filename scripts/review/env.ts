/**
 * Read a positive-integer environment variable. Throws if missing, empty,
 * non-numeric, non-integer, or <= 0.
 */
export function parseIntEnv(name: string): number {
  const raw = process.env[name];
  if (!raw) throw new Error(`Missing env: ${name}`);
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Env ${name} must be a positive integer, got ${JSON.stringify(raw)}`);
  }
  return n;
}
