import { Link, useParams, Outlet, useLocation } from "@tanstack/react-router";

function SettingsPage() {
  const params = useParams({ strict: false });
  const treeId = params.treeId as string;
  const location = useLocation();
  const isReferenceDataActive =
    location.pathname === `/${treeId}/settings` ||
    location.pathname === `/${treeId}/settings/`;
  const isThemeActive = location.pathname === `/${treeId}/settings/theme`;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/$treeId" params={{ treeId }} style={{ color: "#666" }}>
          ← Back to {treeId}
        </Link>
      </div>

      <h1>Settings for {treeId}</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Settings Navigation */}
        <nav
          style={{
            width: "200px",
            borderRight: "1px solid #ddd",
            paddingRight: "20px",
          }}
          aria-label="Settings navigation"
        >
          <h3>Settings</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Link
              to="/$treeId/settings"
              params={{ treeId }}
              style={{
                padding: "10px",
                textDecoration: "none",
                border: `1px solid ${isReferenceDataActive ? "#2196F3" : "#ddd"}`,
                borderRadius: "4px",
                backgroundColor: isReferenceDataActive ? "#e3f2fd" : "#f8f9fa",
                color: isReferenceDataActive ? "#1976d2" : "#333",
              }}
              aria-current={isReferenceDataActive ? "page" : undefined}
            >
              📋 Reference Data
            </Link>
            <Link
              to="/$treeId/settings/theme"
              params={{ treeId }}
              style={{
                padding: "10px",
                textDecoration: "none",
                border: `1px solid ${isThemeActive ? "#2196F3" : "#ddd"}`,
                borderRadius: "4px",
                backgroundColor: isThemeActive ? "#e3f2fd" : "#f8f9fa",
                color: isThemeActive ? "#1976d2" : "#333",
              }}
              aria-current={isThemeActive ? "page" : undefined}
            >
              🎨 Theme
            </Link>
          </div>
        </nav>

        {/* Settings Content */}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;
