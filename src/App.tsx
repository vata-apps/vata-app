import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { createApplicationMenu, openPreferencesWindow } from "./lib/menu";
import { listen } from "@tauri-apps/api/event";

function App() {
  useEffect(() => {
    const setupApp = async () => {
      try {
        // Create and set the application menu
        const menu = await createApplicationMenu();
        await menu.setAsAppMenu();

        // Listen for menu events from Rust
        const unlisten = await listen<string>("menu", (event) => {
          const menuId = event.payload;

          switch (menuId) {
            case "preferences":
              openPreferencesWindow();
              break;
            case "about":
              // TODO: Implement about dialog
              break;
            default:
              // System items handled automatically
              break;
          }
        });

        return () => {
          unlisten();
        };
      } catch (error) {
        console.error("Failed to setup application menu:", error);
      }
    };

    setupApp();
  }, []);

  return <Outlet />;
}

export default App;
