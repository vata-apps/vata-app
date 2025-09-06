import { Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { places } from "../lib/places";
import { Place } from "../lib/db/schema";

function PlacePage() {
  const { treeId, placeId } = useParams({ from: "/$treeId/places/$placeId" });
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlace();
  }, [treeId, placeId]);

  async function loadPlace() {
    try {
      setLoading(true);
      const placeData = await places.getById(treeId, parseInt(placeId));
      setPlace(placeData);
    } catch (err) {
      setError(`Error loading place: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading place...</div>;
  if (error) return <div>Error: {error}</div>;
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
