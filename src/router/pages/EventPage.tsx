import { useParams } from "@tanstack/react-router";

export function EventPage() {
  const { eventId } = useParams({ from: "/events/$eventId" });

  return (
    <div>
      <h1>Event</h1>
      <p>Event ID: {eventId}</p>
    </div>
  );
}
