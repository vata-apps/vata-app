import { Link, useParams } from "@tanstack/react-router";
import { usePlace } from "../hooks/use-places-query";
import { Place } from "../lib/db/schema";

function PlacePage() {
  const { treeId, placeId } = useParams({ from: "/$treeId/places/$placeId" });
  const { data: place, isLoading: loading, error } = usePlace(treeId, placeId);

  if (loading) return <div>Loading place...</div>;
  if (error) return <div>Error: {error instanceof Error ? error.message : String(error)}</div>;
  if (!place) return <div>Place not found</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/$treeId/places"
          params={{ treeId }}
          style={{ color: "#666" }}
        >
          ← Back to Places
        </Link>
      </div>

      <h1>{place.name}</h1>
      <p>
        Tree: <strong>{treeId}</strong>
      </p>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <h3>Place Details</h3>
        <p>
          <strong>ID:</strong> {place.id}
        </p>
        <p>
          <strong>Name:</strong> {place.name}
        </p>
        <p>
          <strong>Type ID:</strong> {place.typeId}
        </p>
        <p>
          <strong>Parent ID:</strong> {place.parentId || "None"}
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {new Date(place.createdAt).toLocaleDateString()}
        </p>

        {place.latitude && place.longitude && (
          <div>
            <p>
              <strong>Coordinates:</strong>
            </p>
            <p>Latitude: {place.latitude}</p>
            <p>Longitude: {place.longitude}</p>
          </div>
        )}

        {place.gedcomId && (
          <p>
            <strong>GEDCOM ID:</strong> {place.gedcomId}
          </p>
        )}
      </div>
    </div>
  );
}

export default PlacePage;
