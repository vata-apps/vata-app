import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  useEventRoles,
  useCreateEventRole,
  useUpdateEventRole,
  useDeleteEventRole,
} from "../../hooks/use-event-roles-query";
import { EventRoleForm } from "../../components/EventRoleForm";
import { EventRole } from "../../lib/db/types";

interface EventRoleFormData {
  name: string;
}

function EventRolesPage() {
  const { treeId } = useParams({ from: "/$treeId/settings/event-roles" });

  const {
    data: eventRolesList = [],
    isLoading,
    error,
    refetch,
  } = useEventRoles(treeId);

  const createEventRoleMutation = useCreateEventRole(treeId);
  const updateEventRoleMutation = useUpdateEventRole(treeId);
  const deleteEventRoleMutation = useDeleteEventRole(treeId);

  const createEmptyFormData = (): EventRoleFormData => ({
    name: "",
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEventRole, setEditingEventRole] = useState<string | null>(null);
  const [newEventRole, setNewEventRole] = useState<EventRoleFormData>(
    createEmptyFormData(),
  );
  const [editEventRole, setEditEventRole] = useState<EventRoleFormData>(
    createEmptyFormData(),
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCreateEventRole = async (formData: EventRoleFormData) => {
    createEventRoleMutation.mutate(
      {
        name: formData.name,
      },
      {
        onSuccess: () => {
          setNewEventRole(createEmptyFormData());
          setShowCreateForm(false);
        },
      },
    );
  };

  const handleDeleteEventRole = (
    eventRoleId: string,
    eventRoleName: string,
  ) => {
    setDeleteConfirm({ id: eventRoleId, name: eventRoleName });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteEventRoleMutation.mutate(deleteConfirm.id, {
        onSuccess: () => {
          setDeleteConfirm(null);
        },
        onError: (error) => {
          console.error("Error deleting event role:", error);
          alert(
            "Failed to delete event role: " +
              (error instanceof Error ? error.message : String(error)),
          );
        },
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const startEditEventRole = (eventRole: EventRole) => {
    setEditingEventRole(eventRole.id);
    setEditEventRole({
      name: eventRole.name,
    });
  };

  const cancelEdit = () => {
    setEditingEventRole(null);
    setEditEventRole(createEmptyFormData());
  };

  const saveEdit = async (eventRoleId: string) => {
    updateEventRoleMutation.mutate(
      {
        eventRoleId,
        updates: {
          name: editEventRole.name,
        },
      },
      {
        onSuccess: () => {
          setEditingEventRole(null);
        },
      },
    );
  };

  if (isLoading) return <div>Loading event roles...</div>;
  if (error)
    return (
      <div style={{ color: "red" }}>
        Error: {error instanceof Error ? error.message : String(error)}
      </div>
    );

  return (
    <div>
      <h2>Event Roles Management</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Manage the different roles participants can have in events.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <p>Found {eventRolesList.length} event roles</p>
        <button onClick={() => refetch()} style={{ marginRight: "10px" }}>
          Refresh
        </button>
        {deleteEventRoleMutation.isPending && (
          <span style={{ color: "#FF9800", marginLeft: "10px" }}>
            Deleting...
          </span>
        )}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            backgroundColor: showCreateForm ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            padding: "8px 16px",
          }}
        >
          {showCreateForm ? "Cancel" : "Create Event Role"}
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
          <h3>Create New Event Role</h3>
          <EventRoleForm
            formData={newEventRole}
            onSubmit={(data) => {
              if (data !== newEventRole) {
                setNewEventRole(data);
              } else {
                handleCreateEventRole(data);
              }
            }}
            submitLabel="Create Event Role"
          />
        </div>
      )}

      {/* Event Roles List */}
      {eventRolesList.length === 0 ? (
        <p>No event roles found. Create your first event role!</p>
      ) : (
        <div>
          <h3>All Event Roles</h3>
          <div>
            {eventRolesList.map((eventRole) => (
              <EventRoleListItem
                key={eventRole.id}
                eventRole={eventRole}
                isEditing={editingEventRole === eventRole.id}
                editFormData={editEventRole}
                onEdit={startEditEventRole}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onDelete={handleDeleteEventRole}
                onFormDataChange={setEditEventRole}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3>Delete Event Role</h3>
            <p>
              Are you sure you want to delete the event role &ldquo;
              {deleteConfirm.name}&rdquo;?
            </p>
            <p style={{ color: "#666", fontSize: "14px" }}>
              This action cannot be undone.
            </p>
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                onClick={cancelDelete}
                style={{
                  backgroundColor: "#666",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  marginRight: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteEventRoleMutation.isPending}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: deleteEventRoleMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  opacity: deleteEventRoleMutation.isPending ? 0.6 : 1,
                }}
              >
                {deleteEventRoleMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EventRoleListItemProps {
  eventRole: EventRole;
  isEditing: boolean;
  editFormData: EventRoleFormData;
  onEdit: (eventRole: EventRole) => void;
  onCancelEdit: () => void;
  onSaveEdit: (eventRoleId: string) => void;
  onDelete: (eventRoleId: string, eventRoleName: string) => void;
  onFormDataChange: (data: EventRoleFormData) => void;
}

function EventRoleListItem({
  eventRole,
  isEditing,
  editFormData,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onFormDataChange,
}: EventRoleListItemProps) {
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
          <h4>Editing Event Role</h4>
          <EventRoleForm
            formData={editFormData}
            onSubmit={(data) => {
              if (data !== editFormData) {
                onFormDataChange(data);
              } else {
                onSaveEdit(eventRole.id);
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
            <strong style={{ fontSize: "18px" }}>{eventRole.name}</strong>
            <div style={{ color: "#666", fontSize: "14px" }}>
              {eventRole.key && (
                <span style={{ fontSize: "12px", color: "#999" }}>
                  Key: {eventRole.key}
                </span>
              )}
              <div style={{ fontSize: "12px", marginTop: "5px" }}>
                Created: {new Date(eventRole.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => onEdit(eventRole)}
              disabled={!!eventRole.key}
              title={
                eventRole.key
                  ? "Cannot edit default event role"
                  : "Edit this event role"
              }
              style={{
                backgroundColor: eventRole.key ? "#ccc" : "#2196F3",
                color: "white",
                border: "none",
                padding: "5px 10px",
                fontSize: "12px",
                marginRight: "5px",
                cursor: eventRole.key ? "not-allowed" : "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(eventRole.id, eventRole.name)}
              disabled={!!eventRole.key}
              title={
                eventRole.key
                  ? "Cannot delete default event role"
                  : "Delete this event role"
              }
              style={{
                backgroundColor: eventRole.key ? "#ccc" : "#f44336",
                color: "white",
                border: "none",
                padding: "5px 10px",
                fontSize: "12px",
                cursor: eventRole.key ? "not-allowed" : "pointer",
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

export default EventRolesPage;
