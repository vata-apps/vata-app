import { Link, useParams } from "@tanstack/react-router";

function TreeHomePage() {
  const { treeId } = useParams({ from: "/$treeId" });

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/" style={{ color: "#666" }}>
          ← Back to Trees
        </Link>
      </div>

      <h1>Tree: {treeId}</h1>
      <p>
        Welcome to your family tree. Choose what you&apos;d like to work with:
      </p>

      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          marginTop: "30px",
        }}
      >
        <Link
          to="/$treeId/places"
          params={{ treeId }}
          style={{
            display: "block",
            padding: "20px",
            border: "2px solid #4CAF50",
            textDecoration: "none",
            color: "#333",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>📍 Places</h2>
          <p>Manage geographic locations in your family history</p>
        </Link>

        <Link
          to="/$treeId/settings"
          params={{ treeId }}
          style={{
            display: "block",
            padding: "20px",
            border: "2px solid #FF9800",
            textDecoration: "none",
            color: "#333",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>⚙️ Settings</h2>
          <p>Manage reference data, types, and configuration</p>
        </Link>

        <Link
          to="/$treeId/individuals"
          params={{ treeId }}
          style={{
            display: "block",
            padding: "20px",
            border: "2px solid #9C27B0",
            textDecoration: "none",
            color: "#333",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>👥 Individuals</h2>
          <p>Manage people and their names in your family tree</p>
        </Link>

        <div
          style={{
            padding: "20px",
            border: "2px solid #ccc",
            color: "#666",
            backgroundColor: "#f5f5f5",
          }}
        >
          <h2>👪 Families</h2>
          <p>Coming soon...</p>
        </div>

        <div
          style={{
            padding: "20px",
            border: "2px solid #ccc",
            color: "#666",
            backgroundColor: "#f5f5f5",
          }}
        >
          <h2>📅 Events</h2>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default TreeHomePage;
