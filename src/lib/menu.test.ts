import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApplicationMenu, openPreferencesWindow } from "./menu";

// Mock Tauri APIs
vi.mock("@tauri-apps/api/menu", () => ({
  Menu: {
    new: vi.fn().mockResolvedValue({
      setAsAppMenu: vi.fn().mockResolvedValue(undefined),
    }),
  },
  MenuItem: {
    new: vi
      .fn()
      .mockImplementation(({ id, text }) =>
        Promise.resolve({ id, text, type: "MenuItem" }),
      ),
  },
  Submenu: {
    new: vi
      .fn()
      .mockImplementation(({ text, items }) =>
        Promise.resolve({ text, items, type: "Submenu" }),
      ),
  },
  PredefinedMenuItem: {
    new: vi
      .fn()
      .mockImplementation(({ item }) =>
        Promise.resolve({ item, type: "PredefinedMenuItem" }),
      ),
  },
}));

vi.mock("@tauri-apps/api/webviewWindow", () => ({
  WebviewWindow: vi.fn().mockImplementation((label, config) => ({
    label,
    config,
    show: vi.fn().mockResolvedValue(undefined),
    setFocus: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe("menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createApplicationMenu", () => {
    it("should create menu with all required submenus", async () => {
      const { Menu } = await import("@tauri-apps/api/menu");

      await createApplicationMenu();

      expect(Menu.new).toHaveBeenCalledWith({
        items: expect.arrayContaining([
          expect.objectContaining({ text: "vata-app", type: "Submenu" }),
          expect.objectContaining({ text: "File", type: "Submenu" }),
          expect.objectContaining({ text: "Edit", type: "Submenu" }),
          expect.objectContaining({ text: "Window", type: "Submenu" }),
        ]),
      });
    });

    it("should create app submenu with preferences item", async () => {
      const { MenuItem } = await import("@tauri-apps/api/menu");

      await createApplicationMenu();

      expect(MenuItem.new).toHaveBeenCalledWith({
        id: "preferences",
        text: "Preferences...",
        accelerator: "CmdOrCtrl+,",
      });
    });

    it("should create file submenu with standard items", async () => {
      const { MenuItem } = await import("@tauri-apps/api/menu");

      await createApplicationMenu();

      expect(MenuItem.new).toHaveBeenCalledWith({
        id: "new",
        text: "New",
        accelerator: "CmdOrCtrl+N",
      });

      expect(MenuItem.new).toHaveBeenCalledWith({
        id: "save",
        text: "Save",
        accelerator: "CmdOrCtrl+S",
      });
    });

    it("should create edit submenu with predefined items", async () => {
      const { PredefinedMenuItem } = await import("@tauri-apps/api/menu");

      await createApplicationMenu();

      expect(PredefinedMenuItem.new).toHaveBeenCalledWith({
        item: "Undo",
      });

      expect(PredefinedMenuItem.new).toHaveBeenCalledWith({
        item: "Copy",
      });
    });
  });

  describe("openPreferencesWindow", () => {
    it("should create new preferences window with correct configuration", async () => {
      const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");

      // Mock getByLabel to throw (no existing window)
      WebviewWindow.getByLabel = vi
        .fn()
        .mockRejectedValue(new Error("Window not found"));

      await openPreferencesWindow();

      expect(WebviewWindow).toHaveBeenCalledWith("preferences", {
        url: "/preferences",
        title: "Preferences",
        width: 700,
        height: 550,
        minWidth: 600,
        minHeight: 500,
        center: true,
        resizable: true,
        maximizable: false,
        minimizable: true,
        closable: true,
        skipTaskbar: false,
        alwaysOnTop: false,
        visible: true,
      });
    });

    it("should show and focus existing window if found", async () => {
      const mockExistingWindow = {
        show: vi.fn().mockResolvedValue(undefined),
        setFocus: vi.fn().mockResolvedValue(undefined),
      };

      const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      WebviewWindow.getByLabel = vi.fn().mockResolvedValue(mockExistingWindow);

      await openPreferencesWindow();

      expect(mockExistingWindow.show).toHaveBeenCalled();
      expect(mockExistingWindow.setFocus).toHaveBeenCalled();
      expect(window).toBe(mockExistingWindow);
    });

    it("should show and focus new window after creation", async () => {
      const mockNewWindow = {
        show: vi.fn().mockResolvedValue(undefined),
        setFocus: vi.fn().mockResolvedValue(undefined),
      };

      const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      WebviewWindow.getByLabel = vi
        .fn()
        .mockRejectedValue(new Error("Window not found"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (WebviewWindow as any).mockImplementation(() => mockNewWindow);

      await openPreferencesWindow();

      expect(mockNewWindow.show).toHaveBeenCalled();
      expect(mockNewWindow.setFocus).toHaveBeenCalled();
    });

    it("should throw error if window creation fails", async () => {
      const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      WebviewWindow.getByLabel = vi
        .fn()
        .mockRejectedValue(new Error("Window not found"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (WebviewWindow as any).mockImplementation(() => {
        throw new Error("Failed to create window");
      });

      await expect(openPreferencesWindow()).rejects.toThrow(
        "Failed to create window",
      );
    });
  });
});
