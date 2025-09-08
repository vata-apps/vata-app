import { useState } from "react";
import { useTheme } from "./lib/theme";
import type { ColorScheme } from "./lib/theme";

function PreferencesApp() {
  const { colorScheme, setColorScheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("general");

  const handleThemeChange = async (newScheme: ColorScheme) => {
    await setColorScheme(newScheme);
  };

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "200px",
          backgroundColor: "#f8f9fa",
          borderRight: "1px solid #e9ecef",
          padding: "20px 0",
        }}
      >
        <div style={{ padding: "0 20px", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            Preferences
          </h2>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: "100%",
                padding: "12px 20px",
                border: "none",
                background: activeTab === tab.id ? "#e3f2fd" : "transparent",
                color: activeTab === tab.id ? "#1976d2" : "#666",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px" }}>
        {activeTab === "general" && (
          <div>
            <h3 style={{ marginTop: 0, marginBottom: "30px" }}>General</h3>
            <div>
              <p style={{ color: "#666", marginBottom: "20px" }}>
                General application settings and preferences.
              </p>
              <div style={{ fontSize: "14px", color: "#888" }}>
                More general settings will be added here in the future.
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div>
            <h3 style={{ marginTop: 0, marginBottom: "30px" }}>Appearance</h3>

            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ marginBottom: "15px", fontSize: "16px" }}>Theme</h4>
              <p
                style={{
                  color: "#666",
                  marginBottom: "20px",
                  fontSize: "14px",
                }}
              >
                Choose how the application should appear
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxWidth: "300px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={colorScheme === "light"}
                    onChange={() => handleThemeChange("light")}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: "14px" }}>🌞 Light Mode</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={colorScheme === "dark"}
                    onChange={() => handleThemeChange("dark")}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: "14px" }}>🌙 Dark Mode</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={colorScheme === "auto"}
                    onChange={() => handleThemeChange("auto")}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: "14px" }}>🔄 Auto (System)</span>
                </label>
              </div>

              <div
                style={{ marginTop: "15px", fontSize: "12px", color: "#888" }}
              >
                Current selection: <strong>{colorScheme}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreferencesApp;
