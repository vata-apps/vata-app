import { Store } from "@tauri-apps/plugin-store";
import { ColorScheme } from "./types";

const THEME_STORE_PATH = ".theme.dat";
const THEME_KEY = "colorScheme";

async function getStore(): Promise<Store> {
  return await Store.load(THEME_STORE_PATH);
}

export async function loadTheme(): Promise<ColorScheme> {
  try {
    const store = await getStore();
    const theme = await store.get<ColorScheme>(THEME_KEY);
    return theme || "auto";
  } catch {
    return "auto";
  }
}

export async function saveTheme(theme: ColorScheme): Promise<void> {
  try {
    const store = await getStore();
    await store.set(THEME_KEY, theme);
    await store.save();
  } catch (error) {
    console.error("Failed to save theme to storage:", error);
  }
}
