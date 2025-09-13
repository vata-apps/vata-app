import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  useEventsQuery,
  useCreateEventMutation,
  useCreateEventWithSubjectMutation,
  useCreateMarriageEventMutation,
  useDeleteEventMutation,
  useIsMarriageEventTypeQuery,
} from "../hooks/use-events-query";
import { useEventTypes } from "../hooks/use-event-types-query";
import { useEventRoles } from "../hooks/use-event-roles-query";
import { usePlaces } from "../hooks/use-places-query";
import { useIndividualsWithNames } from "../hooks/use-individuals-query";
import { CreateEventInput } from "../lib/db/types";

function EventsPage() {
  const { treeId } = useParams({ from: "/$treeId/events" });

  const {
    data: eventsList = [],
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useEventsQuery(treeId);
  const {
    data: eventTypes = [],
    isLoading: typesLoading,
    error: typesError,
  } = useEventTypes(treeId);
  const {
    data: eventRoles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useEventRoles(treeId);
  const {
    data: places = [],
    isLoading: placesLoading,
    error: placesError,
  } = usePlaces(treeId);
  const {
    data: individuals = [],
    isLoading: individualsLoading,
    error: individualsError,
  } = useIndividualsWithNames(treeId);

  const createEventMutation = useCreateEventWithSubjectMutation(treeId);
  const createMarriageMutation = useCreateMarriageEventMutation(treeId);
  const createBasicEventMutation = useCreateEventMutation(treeId);
  const deleteEventMutation = useDeleteEventMutation(treeId);

  const loading =
    eventsLoading ||
    typesLoading ||
    rolesLoading ||
    placesLoading ||
    individualsLoading;
  const error =
    eventsError || typesError || rolesError || placesError || individualsError;

  const createEmptyFormData = (defaultTypeId = ""): CreateEventInput => ({
    typeId: defaultTypeId,
    date: null,
    description: null,
    placeId: null,
    gedcomId: null,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState<CreateEventInput>(
    createEmptyFormData(),
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // For marriage events
  const [selectedHusbandId, setSelectedHusbandId] = useState("");
  const [selectedWifeId, setSelectedWifeId] = useState("");

  // Check if selected event type is marriage
  const { data: isMarriage = false } = useIsMarriageEventTypeQuery(
    treeId,
    newEvent.typeId || "",
  );

  const handleCreateEvent = async () => {
    if (!newEvent.typeId) {
      alert("Please select an event type");
      return;
    }

    if (isMarriage && (selectedHusbandId || selectedWifeId)) {
      // Marriage event with participants
      if (
        selectedHusbandId &&
        selectedWifeId &&
        selectedHusbandId === selectedWifeId
      ) {
        alert("Husband and wife must be different individuals");
        return;
      }

      const husbandRole = eventRoles.find((role) => role.key === "husband");
      const wifeRole = eventRoles.find((role) => role.key === "wife");

      if (!husbandRole || !wifeRole) {
        alert(
          "Husband or Wife role not found. Please check your event roles configuration.",
        );
        return;
      }

      createMarriageMutation.mutate(
        {
          event: newEvent,
          husbandId: selectedHusbandId,
          wifeId: selectedWifeId,
          husbandRoleId: husbandRole.id,
          wifeRoleId: wifeRole.id,
        },
        {
          onSuccess: () => {
            setNewEvent(createEmptyFormData(eventTypes[0]?.id || ""));
            setSelectedHusbandId("");
            setSelectedWifeId("");
            setShowCreateForm(false);
          },
        },
      );
    } else if (!isMarriage && selectedSubjectId) {
      // Regular event with subject
      const subjectRole = eventRoles.find((role) => role.key === "subject");
      if (!subjectRole) {
        alert(
          "Subject role not found. Please check your event roles configuration.",
        );
        return;
      }

      createEventMutation.mutate(
        {
          event: newEvent,
          subjectIndividualId: selectedSubjectId,
          subjectRoleId: subjectRole.id,
        },
        {
          onSuccess: () => {
            setNewEvent(createEmptyFormData(eventTypes[0]?.id || ""));
            setSelectedSubjectId("");
            setShowCreateForm(false);
          },
        },
      );
    } else {
      // Create event without participants (will add them later)
      createBasicEventMutation.mutate(newEvent, {
        onSuccess: () => {
          setNewEvent(createEmptyFormData(eventTypes[0]?.id || ""));
          setSelectedSubjectId("");
          setSelectedHusbandId("");
          setSelectedWifeId("");
          setShowCreateForm(false);
        },
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };

  const getIndividualDisplayName = (individualId: string) => {
    const individual = individuals.find((ind) => ind.id === individualId);
    if (!individual) return "Unknown Individual";

    if (individual.primaryName) {
      const parts = [];
      if (individual.primaryName.first_name)
        parts.push(individual.primaryName.first_name);
      if (individual.primaryName.last_name)
        parts.push(individual.primaryName.last_name);
      if (parts.length > 0) return parts.join(" ");
    }
    return `Individual #${individual.gedcom_id || individual.id.slice(0, 8)}`;
  };

  if (loading) return <div>Loading events...</div>;
  if (error)
    return (
      <div style={{ color: "red" }}>
        Error: {error instanceof Error ? error.message : String(error)}
      </div>
    );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/$treeId" params={{ treeId }} style={{ color: "#666" }}>
          ← Back to {treeId}
        </Link>
      </div>

      <h1>Events in {treeId}</h1>

      <div style={{ marginBottom: "20px" }}>
        <p>Found {eventsList.length} events</p>
        <button onClick={() => refetchEvents()} style={{ marginRight: "10px" }}>
          Refresh
        </button>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            backgroundColor: showCreateForm ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            padding: "8px 16px",
            marginRight: "10px",
          }}
        >
          {showCreateForm ? "Cancel" : "Create Event"}
        </button>
        <Link
          to="/$treeId/settings/event-types"
          params={{ treeId }}
          style={{
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            padding: "8px 16px",
            textDecoration: "none",
            borderRadius: "4px",
            display: "inline-block",
            marginRight: "10px",
          }}
        >
          Manage Event Types
        </Link>
        <Link
          to="/$treeId/settings/event-roles"
          params={{ treeId }}
          style={{
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            padding: "8px 16px",
            textDecoration: "none",
            borderRadius: "4px",
            display: "inline-block",
          }}
        >
          Manage Event Roles
        </Link>
      </div>

      {showCreateForm && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f9f9f9",
            marginBottom: "20px",
            border: "1px solid #ddd",
          }}
        >
          <h3>Create New Event</h3>
          <div>
            <div style={{ marginBottom: "10px" }}>
              <label>Event Type: </label>
              <select
                value={newEvent.typeId || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, typeId: e.target.value })
                }
                style={{ padding: "5px" }}
                required
              >
                <option value="">Select event type...</option>
                {eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Date: </label>
              <input
                type="text"
                value={newEvent.date || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value || null })
                }
                placeholder="Enter date (any format)..."
                style={{ padding: "5px", width: "200px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Description: </label>
              <textarea
                value={newEvent.description || ""}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    description: e.target.value || null,
                  })
                }
                placeholder="Optional description..."
                style={{ padding: "5px", width: "300px", height: "60px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Place: </label>
              <select
                value={newEvent.placeId || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, placeId: e.target.value || null })
                }
                style={{ padding: "5px" }}
              >
                <option value="">None</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>GEDCOM ID (optional): </label>
              <input
                type="number"
                value={newEvent.gedcomId || ""}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    gedcomId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Leave empty for no GEDCOM ID"
                style={{ padding: "5px", width: "150px" }}
              />
            </div>
          </div>

          {newEvent.typeId && (
            <div
              style={{
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "1px solid #ddd",
              }}
            >
              {isMarriage ? (
                <>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      marginBottom: "10px",
                    }}
                  >
                    You can add participants now or create the marriage and add
                    them later.
                  </p>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Husband (optional): </label>
                    <select
                      value={selectedHusbandId}
                      onChange={(e) => setSelectedHusbandId(e.target.value)}
                      style={{ padding: "5px", width: "250px" }}
                    >
                      <option value="">Select husband...</option>
                      {individuals.map((individual) => (
                        <option key={individual.id} value={individual.id}>
                          {getIndividualDisplayName(individual.id)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Wife (optional): </label>
                    <select
                      value={selectedWifeId}
                      onChange={(e) => setSelectedWifeId(e.target.value)}
                      style={{ padding: "5px", width: "250px" }}
                    >
                      <option value="">Select wife...</option>
                      {individuals.map((individual) => (
                        <option key={individual.id} value={individual.id}>
                          {getIndividualDisplayName(individual.id)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleCreateEvent}
                    disabled={!newEvent.typeId}
                    style={{
                      backgroundColor: !newEvent.typeId ? "#ccc" : "#4CAF50",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                    }}
                  >
                    Create Marriage
                  </button>
                </>
              ) : (
                <>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      marginBottom: "10px",
                    }}
                  >
                    You can add a subject now or create the event and add
                    participants later.
                  </p>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Subject (optional): </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      style={{ padding: "5px", width: "250px" }}
                    >
                      <option value="">Select subject...</option>
                      {individuals.map((individual) => (
                        <option key={individual.id} value={individual.id}>
                          {getIndividualDisplayName(individual.id)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleCreateEvent}
                    disabled={!newEvent.typeId}
                    style={{
                      backgroundColor: !newEvent.typeId ? "#ccc" : "#4CAF50",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                    }}
                  >
                    Create Event
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Events List */}
      {eventsList.length === 0 ? (
        <p>No events found. Create your first event!</p>
      ) : (
        <div>
          <h2>All Events</h2>
          <div>
            {eventsList.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: "15px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Link
                      to="/$treeId/events/$eventId"
                      params={{ treeId, eventId: event.id }}
                      style={{ textDecoration: "none" }}
                    >
                      <strong style={{ fontSize: "18px" }}>
                        {eventTypes.find((t) => t.id === event.type_id)?.name ||
                          "Unknown Type"}
                        {event.date && ` - ${event.date}`}
                      </strong>
                    </Link>
                    <div style={{ color: "#666", fontSize: "14px" }}>
                      GEDCOM ID: #{event.gedcom_id} • {event.participantCount}{" "}
                      participant{event.participantCount !== 1 ? "s" : ""}
                      {event.place_id &&
                        ` • Place: ${places.find((p) => p.id === event.place_id)?.name || "Unknown"}`}
                      {event.description && (
                        <div style={{ marginTop: "5px", fontStyle: "italic" }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      style={{
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        fontSize: "12px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
