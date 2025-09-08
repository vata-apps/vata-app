import {
  Menu,
  MenuItem,
  Submenu,
  PredefinedMenuItem,
} from "@tauri-apps/api/menu";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function createApplicationMenu() {
  // Create application submenu (macOS requirement - first submenu becomes app menu)
  const appSubmenu = await Submenu.new({
    text: "vata-app",
    items: [
      await MenuItem.new({
        id: "about",
        text: "About vata-app",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await MenuItem.new({
        id: "preferences",
        text: "Preferences...",
        accelerator: "CmdOrCtrl+,",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "Services",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "Hide",
      }),
      await PredefinedMenuItem.new({
        item: "HideOthers",
      }),
      await PredefinedMenuItem.new({
        item: "ShowAll",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "Quit",
      }),
    ],
  });

  // Create File submenu with standard items
  const fileSubmenu = await Submenu.new({
    text: "File",
    items: [
      await MenuItem.new({
        id: "new",
        text: "New",
        accelerator: "CmdOrCtrl+N",
      }),
      await MenuItem.new({
        id: "open",
        text: "Open",
        accelerator: "CmdOrCtrl+O",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await MenuItem.new({
        id: "save",
        text: "Save",
        accelerator: "CmdOrCtrl+S",
      }),
      await MenuItem.new({
        id: "save_as",
        text: "Save As...",
        accelerator: "CmdOrCtrl+Shift+S",
      }),
    ],
  });

  // Create Edit submenu with standard items
  const editSubmenu = await Submenu.new({
    text: "Edit",
    items: [
      await PredefinedMenuItem.new({
        item: "Undo",
      }),
      await PredefinedMenuItem.new({
        item: "Redo",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "Cut",
      }),
      await PredefinedMenuItem.new({
        item: "Copy",
      }),
      await PredefinedMenuItem.new({
        item: "Paste",
      }),
      await PredefinedMenuItem.new({
        item: "SelectAll",
      }),
    ],
  });

  // Create Window submenu with standard items
  const windowSubmenu = await Submenu.new({
    text: "Window",
    items: [
      await PredefinedMenuItem.new({
        item: "Minimize",
      }),
      await PredefinedMenuItem.new({
        item: "Maximize",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "CloseWindow",
      }),
    ],
  });

  // Create main menu with submenus
  const menu = await Menu.new({
    items: [appSubmenu, fileSubmenu, editSubmenu, windowSubmenu],
  });

  return menu;
}

export async function openPreferencesWindow() {
  try {
    // Try to get existing preferences window
    const existingWindow = await WebviewWindow.getByLabel("preferences");
    if (existingWindow) {
      await existingWindow.show();
      await existingWindow.setFocus();
      return existingWindow;
    }
  } catch {
    // No existing window found, will create new one
  }

  try {
    // Create new preferences window
    const preferencesWindow = new WebviewWindow("preferences", {
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

    await preferencesWindow.show();
    await preferencesWindow.setFocus();

    return preferencesWindow;
  } catch (error) {
    console.error("Failed to create preferences window:", error);
    throw error;
  }
}
