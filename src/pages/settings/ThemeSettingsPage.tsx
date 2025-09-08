import { useTheme } from "../../lib/theme";
import type { ColorScheme } from "../../lib/theme";

function ThemeSettingsPage() {
  const { colorScheme, setColorScheme } = useTheme();

  const handleThemeChange = async (newScheme: ColorScheme) => {
    await setColorScheme(newScheme);
  };

  return (
    <div>
      <h2>Theme Settings</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Choose your preferred theme for the application.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "400px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "white",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Color Scheme</h3>
          <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
            Select how the application should appear
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="theme"
                value="light"
                checked={colorScheme === "light"}
                onChange={() => handleThemeChange("light")}
              />
              <span>🌞 Light Mode</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={colorScheme === "dark"}
                onChange={() => handleThemeChange("dark")}
              />
              <span>🌙 Dark Mode</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="theme"
                value="auto"
                checked={colorScheme === "auto"}
                onChange={() => handleThemeChange("auto")}
              />
              <span>🔄 Auto (follows system)</span>
            </label>
          </div>

          <div style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
            Current selection: <strong>{colorScheme}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeSettingsPage;
