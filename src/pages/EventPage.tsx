import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  useEventQuery,
  useUpdateEventMutation,
  useAddEventParticipantMutation,
  useUpdateEventParticipantMutation,
  useRemoveEventParticipantMutation,
} from "../hooks/use-events-query";
import { useEventTypes } from "../hooks/use-event-types-query";
import { useEventRoles } from "../hooks/use-event-roles-query";
import { usePlaces } from "../hooks/use-places-query";
import { useIndividualsWithNames } from "../hooks/use-individuals-query";
import {
  UpdateEventInput,
  EventParticipant,
  CreateEventParticipantInput,
  UpdateEventParticipantInput,
} from "../lib/db/types";

function EventPage() {
  const { treeId, eventId } = useParams({ from: "/$treeId/events/$eventId" });

  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useEventQuery(treeId, eventId);
  const { data: eventTypes = [] } = useEventTypes(treeId);
  const { data: eventRoles = [] } = useEventRoles(treeId);
  const { data: places = [] } = usePlaces(treeId);
  const { data: individuals = [] } = useIndividualsWithNames(treeId);

  const updateEventMutation = useUpdateEventMutation(treeId);
  const addParticipantMutation = useAddEventParticipantMutation(treeId);
  const updateParticipantMutation = useUpdateEventParticipantMutation(treeId);
  const removeParticipantMutation = useRemoveEventParticipantMutation(treeId);

  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editEventData, setEditEventData] = useState<UpdateEventInput>({});
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] =
    useState<CreateEventParticipantInput>({
      eventId,
      individualId: "",
      roleId: "",
    });
  const [editingParticipant, setEditingParticipant] = useState<string | null>(
    null,
  );
  const [editParticipantData, setEditParticipantData] =
    useState<UpdateEventParticipantInput>({});

  const startEditEvent = () => {
    if (!event) return;
    setEditEventData({
      typeId: event.type_id,
      date: event.date,
      description: event.description,
      placeId: event.place_id,
      gedcomId: event.gedcom_id,
    });
    setIsEditingEvent(true);
  };

  const saveEventEdit = () => {
    updateEventMutation.mutate(
      { id: eventId, updates: editEventData },
      {
        onSuccess: () => {
          setIsEditingEvent(false);
          setEditEventData({});
        },
      },
    );
  };

  const startEditParticipant = (participant: EventParticipant) => {
    setEditingParticipant(participant.id);
    setEditParticipantData({
      individualId: participant.individual_id,
      roleId: participant.role_id,
    });
  };

  const saveParticipantEdit = () => {
    if (!editingParticipant) return;
    updateParticipantMutation.mutate(
      { id: editingParticipant, updates: editParticipantData },
      {
        onSuccess: () => {
          setEditingParticipant(null);
          setEditParticipantData({});
        },
      },
    );
  };

  const handleAddParticipant = () => {
    if (!newParticipant.individualId || !newParticipant.roleId) {
      alert("Please select both individual and role");
      return;
    }

    addParticipantMutation.mutate(newParticipant, {
      onSuccess: () => {
        setNewParticipant({ eventId, individualId: "", roleId: "" });
        setShowAddParticipant(false);
      },
    });
  };

  const handleRemoveParticipant = async (participant: EventParticipant) => {
    removeParticipantMutation.mutate({
      id: participant.id,
      eventId: participant.event_id,
    });
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

  if (eventLoading) return <div>Loading event...</div>;
  if (eventError)
    return (
      <div>
        Error:{" "}
        {eventError instanceof Error ? eventError.message : String(eventError)}
      </div>
    );
  if (!event) return <div>Event not found</div>;

  // Find related data
  const eventType = eventTypes.find((t) => t.id === event.type_id);
  const eventPlace = event.place_id
    ? places.find((p) => p.id === event.place_id)
    : null;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/$treeId/events"
          params={{ treeId }}
          style={{ color: "#666" }}
        >
          ← Back to Events
        </Link>
      </div>

      <h1>
        {eventType ? eventType.name : "Unknown Event Type"}
        {event.date && ` - ${event.date}`}
      </h1>
      <p>
        Tree: <strong>{treeId}</strong> • GEDCOM ID:{" "}
        <strong>#{event.gedcom_id}</strong>
      </p>

      {/* Event Details Section */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f0f0f0",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3>Event Details</h3>
          <button
            onClick={startEditEvent}
            style={{
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              padding: "5px 10px",
              display: isEditingEvent ? "none" : "block",
            }}
          >
            Edit
          </button>
        </div>

        {isEditingEvent ? (
          <div>
            <div style={{ marginBottom: "10px" }}>
              <label>Event Type: </label>
              <select
                value={editEventData.typeId || ""}
                onChange={(e) =>
                  setEditEventData({ ...editEventData, typeId: e.target.value })
                }
                style={{ padding: "5px" }}
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
                value={editEventData.date || ""}
                onChange={(e) =>
                  setEditEventData({
                    ...editEventData,
                    date: e.target.value || null,
                  })
                }
                placeholder="Enter date (any format)..."
                style={{ padding: "5px", width: "200px" }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Description: </label>
              <textarea
                value={editEventData.description || ""}
                onChange={(e) =>
                  setEditEventData({
                    ...editEventData,
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
                value={editEventData.placeId || ""}
                onChange={(e) =>
                  setEditEventData({
                    ...editEventData,
                    placeId: e.target.value || null,
                  })
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
              <label>GEDCOM ID: </label>
              <input
                type="number"
                value={editEventData.gedcomId || ""}
                onChange={(e) =>
                  setEditEventData({
                    ...editEventData,
                    gedcomId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Leave empty for no GEDCOM ID"
                style={{ padding: "5px", width: "150px" }}
              />
            </div>

            <button
              onClick={saveEventEdit}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "10px 20px",
                marginRight: "10px",
              }}
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditingEvent(false);
                setEditEventData({});
              }}
              style={{
                backgroundColor: "#666",
                color: "white",
                border: "none",
                padding: "10px 20px",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <p>
              <strong>Type:</strong>{" "}
              {eventType ? eventType.name : `Unknown (ID: ${event.type_id})`}
            </p>
            <p>
              <strong>Date:</strong> {event.date || "Not specified"}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {event.description || "No description"}
            </p>
            <p>
              <strong>Place:</strong>{" "}
              {eventPlace
                ? eventPlace.name
                : event.place_id
                  ? `Unknown (ID: ${event.place_id})`
                  : "Not specified"}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {(() => {
                try {
                  let date;
                  if (typeof event.created_at === "string") {
                    date = new Date(event.created_at);
                  } else if (typeof event.created_at === "number") {
                    date = new Date(
                      event.created_at > 1e10
                        ? event.created_at
                        : event.created_at * 1000,
                    );
                  } else {
                    return event.created_at;
                  }
                  return date.toLocaleDateString();
                } catch {
                  return `Raw: ${event.created_at}`;
                }
              })()}
            </p>
          </div>
        )}
      </div>

      {/* Event Participants Section */}
      <div style={{ marginTop: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3>Participants ({event.participants.length})</h3>
          <button
            onClick={() => setShowAddParticipant(!showAddParticipant)}
            style={{
              backgroundColor: showAddParticipant ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              padding: "8px 16px",
            }}
          >
            {showAddParticipant ? "Cancel" : "Add Participant"}
          </button>
        </div>

        {showAddParticipant && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f9f9f9",
              marginBottom: "15px",
              border: "1px solid #ddd",
            }}
          >
            <h4>Add New Participant</h4>
            <div>
              <div style={{ marginBottom: "10px" }}>
                <label>Individual: </label>
                <select
                  value={newParticipant.individualId}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      individualId: e.target.value,
                    })
                  }
                  style={{ padding: "5px", width: "250px" }}
                  required
                >
                  <option value="">Select individual...</option>
                  {individuals.map((individual) => (
                    <option key={individual.id} value={individual.id}>
                      {getIndividualDisplayName(individual.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Role: </label>
                <select
                  value={newParticipant.roleId}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      roleId: e.target.value,
                    })
                  }
                  style={{ padding: "5px" }}
                  required
                >
                  <option value="">Select role...</option>
                  {eventRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddParticipant}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                }}
              >
                Add Participant
              </button>
            </div>
          </div>
        )}

        {event.participants.length === 0 ? (
          <p>No participants yet. Add the first participant!</p>
        ) : (
          <div>
            {event.participants.map((participant) => (
              <div
                key={participant.id}
                style={{
                  padding: "15px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  backgroundColor: "white",
                }}
              >
                {editingParticipant === participant.id ? (
                  <div>
                    <h4>Editing Participant</h4>
                    <div>
                      <div style={{ marginBottom: "10px" }}>
                        <label>Individual: </label>
                        <select
                          value={editParticipantData.individualId || ""}
                          onChange={(e) =>
                            setEditParticipantData({
                              ...editParticipantData,
                              individualId: e.target.value,
                            })
                          }
                          style={{ padding: "5px", width: "250px" }}
                          required
                        >
                          <option value="">Select individual...</option>
                          {individuals.map((individual) => (
                            <option key={individual.id} value={individual.id}>
                              {getIndividualDisplayName(individual.id)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label>Role: </label>
                        <select
                          value={editParticipantData.roleId || ""}
                          onChange={(e) =>
                            setEditParticipantData({
                              ...editParticipantData,
                              roleId: e.target.value,
                            })
                          }
                          style={{ padding: "5px" }}
                          required
                        >
                          <option value="">Select role...</option>
                          {eventRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={saveParticipantEdit}
                        style={{
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          marginRight: "10px",
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingParticipant(null);
                          setEditParticipantData({});
                        }}
                        style={{
                          backgroundColor: "#666",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>
                        {getIndividualDisplayName(participant.individual_id)}
                      </strong>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        Role:{" "}
                        {eventRoles.find((r) => r.id === participant.role_id)
                          ?.name || "Unknown Role"}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => startEditParticipant(participant)}
                        style={{
                          backgroundColor: "#2196F3",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          fontSize: "12px",
                          marginRight: "5px",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveParticipant(participant)}
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          fontSize: "12px",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventPage;
