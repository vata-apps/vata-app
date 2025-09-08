import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { listen, emit } from "@tauri-apps/api/event";
import { ColorScheme, ThemeContextValue } from "./types";
import { loadTheme, saveTheme } from "./storage";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children:
    | ReactNode
    | ((
        context: ThemeContextValue & {
          mantineColorScheme: "light" | "dark" | undefined;
        },
      ) => ReactNode);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("auto");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const initializeTheme = async () => {
      const savedTheme = await loadTheme();
      setColorSchemeState(savedTheme);
      setIsLoaded(true);

      // Listen for theme change events from other windows
      unlisten = await listen<ColorScheme>("theme-changed", (event) => {
        setColorSchemeState(event.payload);
      });
    };

    initializeTheme();

    return () => {
      unlisten?.();
    };
  }, []);

  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    await saveTheme(scheme);

    // Emit theme change event to other windows
    try {
      await emit("theme-changed", scheme);
    } catch (error) {
      console.error("Failed to emit theme change event:", error);
    }
  };

  const toggleColorScheme = async () => {
    const nextScheme = colorScheme === "light" ? "dark" : "light";
    await setColorScheme(nextScheme);
  };

  const contextValue: ThemeContextValue = {
    colorScheme,
    setColorScheme,
    toggleColorScheme,
  };

  // Convert our ColorScheme to Mantine's expected type
  const mantineColorScheme: "light" | "dark" | undefined =
    colorScheme === "auto" ? undefined : colorScheme;

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {typeof children === "function"
        ? children({ ...contextValue, mantineColorScheme })
        : children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
