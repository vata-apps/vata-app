import { useParams } from "@tanstack/react-router";

export function PlacePage() {
  const { placeId } = useParams({ from: "/places/$placeId" });

  return (
    <div>
      <h1>Place</h1>
      <p>Place ID: {placeId}</p>
    </div>
  );
}
