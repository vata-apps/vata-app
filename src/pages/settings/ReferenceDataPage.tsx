import { Link, useParams } from "@tanstack/react-router";

function ReferenceDataPage() {
  const params = useParams({ strict: false });
  const treeId = params.treeId as string;

  return (
    <div>
      <h2>Reference Data Management</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Manage reference data and types used throughout your genealogy tree.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Place Types Card */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "white",
          }}
        >
          <h3>Place Types</h3>
          <p style={{ color: "#666", marginBottom: "15px" }}>
            Manage the different types of places (City, Country, State, etc.)
          </p>
          <Link
            to="/$treeId/settings/place-types"
            params={{ treeId }}
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            Manage Place Types
          </Link>
        </div>

        {/* Event Types Card */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "white",
          }}
        >
          <h3>Event Types</h3>
          <p style={{ color: "#666", marginBottom: "15px" }}>
            Manage the different types of events (Birth, Marriage, Death, etc.)
          </p>
          <Link
            to="/$treeId/settings/event-types"
            params={{ treeId }}
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            Manage Event Types
          </Link>
        </div>

        {/* Event Roles Card */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "white",
          }}
        >
          <h3>Event Roles</h3>
          <p style={{ color: "#666", marginBottom: "15px" }}>
            Manage participant roles in events (Subject, Witness, Officiant,
            etc.)
          </p>
          <Link
            to="/$treeId/settings/event-roles"
            params={{ treeId }}
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#FF9800",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            Manage Event Roles
          </Link>
        </div>

        <div
          style={{
            border: "1px dashed #ccc",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            opacity: 0.6,
          }}
        >
          <h3>Relationship Types</h3>
          <p style={{ color: "#666", marginBottom: "15px" }}>
            Coming soon: Manage relationship types and roles
          </p>
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#ccc",
              color: "#666",
              borderRadius: "4px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferenceDataPage;
