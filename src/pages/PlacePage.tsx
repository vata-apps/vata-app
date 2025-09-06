import { Link, useParams } from "@tanstack/react-router";
import { usePlace, usePlaceTypes, usePlaces } from "../hooks/use-places-query";

function PlacePage() {
  const { treeId, placeId } = useParams({ from: "/$treeId/places/$placeId" });
  const { data: place, isLoading: loading, error } = usePlace(treeId, placeId);
  const { data: placeTypes = [] } = usePlaceTypes(treeId);
  const { data: allPlaces = [] } = usePlaces(treeId);

  if (loading) return <div>Loading place...</div>;
  if (error)
    return (
      <div>Error: {error instanceof Error ? error.message : String(error)}</div>
    );
  if (!place) return <div>Place not found</div>;

  // Find the place type name
  const placeType = placeTypes.find((t) => t.id === place.type_id);

  // Find the parent place name
  const parentPlace = place.parent_id
    ? allPlaces.find((p) => p.id === place.parent_id)
    : null;

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
          <strong>Type:</strong>{" "}
          {placeType ? placeType.name : `Unknown (ID: ${place.type_id})`}
        </p>
        <p>
          <strong>Parent:</strong>{" "}
          {parentPlace ? `${parentPlace.name} (${parentPlace.id})` : "None"}
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {place.created_at
            ? (() => {
                try {
                  // Try different date parsing approaches
                  let date;
                  if (typeof place.created_at === "string") {
                    date = new Date(place.created_at);
                  } else if (typeof place.created_at === "number") {
                    // Could be timestamp in seconds or milliseconds
                    date = new Date(
                      place.created_at > 1e10
                        ? place.created_at
                        : place.created_at * 1000,
                    );
                  } else {
                    return place.created_at;
                  }
                  return date.toLocaleDateString();
                } catch {
                  return `Raw: ${place.created_at}`;
                }
              })()
            : "Unknown"}
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

        {place.gedcom_id && (
          <p>
            <strong>GEDCOM ID:</strong> {place.gedcom_id}
          </p>
        )}
      </div>
    </div>
  );
}

export default PlacePage;
