import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Link, Outlet } from "@tanstack/react-router";

export function RootLayout() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications />

      {/* Simple navigation for testing */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h3>Navigation (Testing)</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Home
          </Link>
          <Link
            to="/individuals"
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Individuals
          </Link>
          <Link
            to="/families"
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Families
          </Link>
          <Link
            to="/places"
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Places
          </Link>
          <Link
            to="/events"
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Events
          </Link>
          <Link
            to="/settings"
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Settings
          </Link>
        </div>
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          Note: Parameter routes (like /individuals/123) can be tested by
          manually typing the URL
        </p>
      </div>

      <Outlet />
    </MantineProvider>
  );
}
