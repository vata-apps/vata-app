import { Link, useParams } from "@tanstack/react-router";

export function EventsPage() {
  const { treeId } = useParams({ from: "/$treeId/events" });

  return (
    <div>
      <h1>Events</h1>
      <p>Tree ID: {treeId}</p>
      <Link to="/$treeId/events/$eventId" params={{ treeId, eventId: "1" }}>
        Event 1
      </Link>
    </div>
  );
}
