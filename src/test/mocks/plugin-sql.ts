import { vi } from 'vitest';

export const mockDb = {
  execute: vi.fn().mockResolvedValue({ rowsAffected: 1, lastInsertId: 1 }),
  select: vi.fn().mockResolvedValue([]),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: vi.fn().mockResolvedValue(mockDb),
  },
}));
