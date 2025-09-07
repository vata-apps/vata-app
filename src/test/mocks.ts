import { vi } from "vitest";

export const mockDatabase = {
  execute: vi.fn(),
  select: vi.fn(),
  load: vi.fn().mockResolvedValue({
    execute: vi.fn(),
    select: vi.fn(),
  }),
  close: vi.fn(),
};

export const mockUuid = {
  v4: vi.fn(() => "mock-uuid-1234"),
};

export const mockFs = {
  exists: vi.fn(),
  mkdir: vi.fn(),
  remove: vi.fn(),
  readDir: vi.fn(),
  BaseDirectory: {
    AppData: 1,
  },
};

vi.mock("@tauri-apps/plugin-sql", () => ({
  default: mockDatabase,
}));

vi.mock("uuid", () => ({
  v4: mockUuid.v4,
}));

vi.mock("@tauri-apps/plugin-fs", () => mockFs);
