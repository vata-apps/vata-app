import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  useEventTypes,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from "../../hooks/use-event-types-query";
import { EventTypeForm } from "../../components/EventTypeForm";
import { EventType } from "../../lib/db/types";

interface EventTypeFormData {
  name: string;
}

function EventTypesPage() {
  const { treeId } = useParams({ from: "/$treeId/settings/event-types" });

  const {
    data: eventTypesList = [],
    isLoading,
    error,
    refetch,
  } = useEventTypes(treeId);

  const createEventTypeMutation = useCreateEventType(treeId);
  const updateEventTypeMutation = useUpdateEventType(treeId);
  const deleteEventTypeMutation = useDeleteEventType(treeId);

  const createEmptyFormData = (): EventTypeFormData => ({
    name: "",
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEventType, setEditingEventType] = useState<string | null>(null);
  const [newEventType, setNewEventType] = useState<EventTypeFormData>(
    createEmptyFormData(),
  );
  const [editEventType, setEditEventType] = useState<EventTypeFormData>(
    createEmptyFormData(),
  );

  const handleCreateEventType = async (formData: EventTypeFormData) => {
    createEventTypeMutation.mutate(
      {
        name: formData.name,
      },
      {
        onSuccess: () => {
          setNewEventType(createEmptyFormData());
          setShowCreateForm(false);
        },
      },
    );
  };

  const handleDeleteEventType = async (eventTypeId: string) => {
    if (window.confirm("Are you sure you want to delete this event type?")) {
      deleteEventTypeMutation.mutate(eventTypeId);
    }
  };

  const startEditEventType = (eventType: EventType) => {
    setEditingEventType(eventType.id);
    setEditEventType({
      name: eventType.name,
    });
  };

  const cancelEdit = () => {
    setEditingEventType(null);
    setEditEventType(createEmptyFormData());
  };

  const saveEdit = async (eventTypeId: string) => {
    updateEventTypeMutation.mutate(
      {
        eventTypeId,
        updates: {
          name: editEventType.name,
        },
      },
      {
        onSuccess: () => {
          setEditingEventType(null);
        },
      },
    );
  };

  if (isLoading) return <div>Loading event types...</div>;
  if (error)
    return (
      <div style={{ color: "red" }}>
        Error: {error instanceof Error ? error.message : String(error)}
      </div>
    );

  return (
    <div>
      <h2>Event Types Management</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Manage the different types of events used in your genealogy tree.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <p>Found {eventTypesList.length} event types</p>
        <button onClick={() => refetch()} style={{ marginRight: "10px" }}>
          Refresh
        </button>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            backgroundColor: showCreateForm ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            padding: "8px 16px",
          }}
        >
          {showCreateForm ? "Cancel" : "Create Event Type"}
        </button>
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
          <h3>Create New Event Type</h3>
          <EventTypeForm
            formData={newEventType}
            onSubmit={(data) => {
              if (data !== newEventType) {
                setNewEventType(data);
              } else {
                handleCreateEventType(data);
              }
            }}
            submitLabel="Create Event Type"
          />
        </div>
      )}

      {/* Event Types List */}
      {eventTypesList.length === 0 ? (
        <p>No event types found. Create your first event type!</p>
      ) : (
        <div>
          <h3>All Event Types</h3>
          <div>
            {eventTypesList.map((eventType) => (
              <EventTypeListItem
                key={eventType.id}
                eventType={eventType}
                isEditing={editingEventType === eventType.id}
                editFormData={editEventType}
                onEdit={startEditEventType}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onDelete={handleDeleteEventType}
                onFormDataChange={setEditEventType}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface EventTypeListItemProps {
  eventType: EventType;
  isEditing: boolean;
  editFormData: EventTypeFormData;
  onEdit: (eventType: EventType) => void;
  onCancelEdit: () => void;
  onSaveEdit: (eventTypeId: string) => void;
  onDelete: (eventTypeId: string) => void;
  onFormDataChange: (data: EventTypeFormData) => void;
}

function EventTypeListItem({
  eventType,
  isEditing,
  editFormData,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onFormDataChange,
}: EventTypeListItemProps) {
  return (
    <div
      style={{
        padding: "15px",
        border: "1px solid #ccc",
        marginBottom: "10px",
        backgroundColor: "white",
      }}
    >
      {isEditing ? (
        <div>
          <h4>Editing Event Type</h4>
          <EventTypeForm
            formData={editFormData}
            onSubmit={(data) => {
              if (data !== editFormData) {
                onFormDataChange(data);
              } else {
                onSaveEdit(eventType.id);
              }
            }}
            onCancel={onCancelEdit}
            submitLabel="Save"
          />
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
            <strong style={{ fontSize: "18px" }}>{eventType.name}</strong>
            <div style={{ color: "#666", fontSize: "14px" }}>
              {eventType.key && (
                <span style={{ fontSize: "12px", color: "#999" }}>
                  Key: {eventType.key}
                </span>
              )}
              <div style={{ fontSize: "12px", marginTop: "5px" }}>
                Created: {new Date(eventType.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => onEdit(eventType)}
              disabled={!!eventType.key}
              title={
                eventType.key
                  ? "Cannot edit default event type"
                  : "Edit this event type"
              }
              style={{
                backgroundColor: eventType.key ? "#ccc" : "#2196F3",
                color: "white",
                border: "none",
                padding: "5px 10px",
                fontSize: "12px",
                marginRight: "5px",
                cursor: eventType.key ? "not-allowed" : "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(eventType.id)}
              disabled={!!eventType.key}
              title={
                eventType.key
                  ? "Cannot delete default event type"
                  : "Delete this event type"
              }
              style={{
                backgroundColor: eventType.key ? "#ccc" : "#f44336",
                color: "white",
                border: "none",
                padding: "5px 10px",
                fontSize: "12px",
                cursor: eventType.key ? "not-allowed" : "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventTypesPage;
