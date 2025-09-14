import { vi } from "vitest";

// Mock Tauri plugins
vi.mock("@tauri-apps/plugin-fs", () => ({
  exists: vi.fn(),
  rename: vi.fn(),
  remove: vi.fn(),
  copyFile: vi.fn(),
  mkdir: vi.fn(),
  BaseDirectory: {
    AppData: "AppData",
  },
}));

// Mock Tauri SQL plugin
vi.mock("@tauri-apps/plugin-sql", () => ({
  load: vi.fn(),
}));

// Mock Tauri Store plugin
vi.mock("@tauri-apps/plugin-store", () => ({
  Store: vi.fn(),
}));
