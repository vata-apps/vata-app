import { Link, Outlet, useParams } from "@tanstack/react-router";

export function TreeLayout() {
  const { treeId } = useParams({ from: "/$treeId" });
  return (
    <>
      <div
        style={{
          padding: "20px",
        }}
      >
        <h3>Navigation (Testing)</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            to="/$treeId"
            params={{ treeId }}
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
            to="/$treeId/individuals"
            params={{ treeId }}
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
            to="/$treeId/families"
            params={{ treeId }}
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
            to="/$treeId/places"
            params={{ treeId }}
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
            to="/$treeId/events"
            params={{ treeId }}
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
            to="/$treeId/settings"
            params={{ treeId }}
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
          <Link
            to="/"
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              marginLeft: "auto",
            }}
          >
            All trees
          </Link>
        </div>
      </div>

      <div
        style={{
          padding: "20px",
        }}
      >
        <Outlet />
      </div>
    </>
  );
}
