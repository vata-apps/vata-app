import { useParams } from "@tanstack/react-router";

export function EventPage() {
  const { eventId, treeId } = useParams({ from: "/$treeId/events/$eventId" });

  return (
    <div>
      <h1>Event</h1>
      <p>Tree ID: {treeId}</p>
      <p>Event ID: {eventId}</p>
    </div>
  );
}
