import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  usePlaceTypes,
  useCreatePlaceType,
  useUpdatePlaceType,
  useDeletePlaceType,
  usePlaceTypeUsage,
} from "../../hooks/use-place-types-query";
import { PlaceTypeForm } from "../../components/PlaceTypeForm";
import { PlaceType } from "../../lib/db/types";

interface PlaceTypeFormData {
  name: string;
}

function PlaceTypesPage() {
  const { treeId } = useParams({ from: "/$treeId/settings/place-types" });

  const {
    data: placeTypesList = [],
    isLoading,
    error,
    refetch,
  } = usePlaceTypes(treeId);

  const createPlaceTypeMutation = useCreatePlaceType(treeId);
  const updatePlaceTypeMutation = useUpdatePlaceType(treeId);
  const deletePlaceTypeMutation = useDeletePlaceType(treeId);

  const createEmptyFormData = (): PlaceTypeFormData => ({
    name: "",
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlaceType, setEditingPlaceType] = useState<string | null>(null);
  const [newPlaceType, setNewPlaceType] = useState<PlaceTypeFormData>(
    createEmptyFormData(),
  );
  const [editPlaceType, setEditPlaceType] = useState<PlaceTypeFormData>(
    createEmptyFormData(),
  );

  const handleCreatePlaceType = async (formData: PlaceTypeFormData) => {
    createPlaceTypeMutation.mutate(
      {
        name: formData.name,
      },
      {
        onSuccess: () => {
          setNewPlaceType(createEmptyFormData());
          setShowCreateForm(false);
        },
      },
    );
  };

  const handleDeletePlaceType = async (placeTypeId: string) => {
    if (window.confirm("Are you sure you want to delete this place type?")) {
      deletePlaceTypeMutation.mutate(placeTypeId);
    }
  };

  const startEditPlaceType = (placeType: PlaceType) => {
    setEditingPlaceType(placeType.id);
    setEditPlaceType({
      name: placeType.name,
    });
  };

  const cancelEdit = () => {
    setEditingPlaceType(null);
    setEditPlaceType(createEmptyFormData());
  };

  const saveEdit = async (placeTypeId: string) => {
    updatePlaceTypeMutation.mutate(
      {
        placeTypeId,
        updates: {
          name: editPlaceType.name,
        },
      },
      {
        onSuccess: () => {
          setEditingPlaceType(null);
        },
      },
    );
  };

  if (isLoading) return <div>Loading place types...</div>;
  if (error)
    return (
      <div style={{ color: "red" }}>
        Error: {error instanceof Error ? error.message : String(error)}
      </div>
    );

  return (
    <div>
      <h2>Place Types Management</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Manage the different types of places used in your genealogy tree.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <p>Found {placeTypesList.length} place types</p>
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
          {showCreateForm ? "Cancel" : "Create Place Type"}
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
          <h3>Create New Place Type</h3>
          <PlaceTypeForm
            formData={newPlaceType}
            onSubmit={(data) => {
              if (data !== newPlaceType) {
                setNewPlaceType(data);
              } else {
                handleCreatePlaceType(data);
              }
            }}
            submitLabel="Create Place Type"
          />
        </div>
      )}

      {/* Place Types List */}
      {placeTypesList.length === 0 ? (
        <p>No place types found. Create your first place type!</p>
      ) : (
        <div>
          <h3>All Place Types</h3>
          <div>
            {placeTypesList.map((placeType) => (
              <PlaceTypeListItem
                key={placeType.id}
                placeType={placeType}
                treeId={treeId}
                isEditing={editingPlaceType === placeType.id}
                editFormData={editPlaceType}
                onEdit={startEditPlaceType}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onDelete={handleDeletePlaceType}
                onFormDataChange={setEditPlaceType}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PlaceTypeListItemProps {
  placeType: PlaceType;
  treeId: string;
  isEditing: boolean;
  editFormData: PlaceTypeFormData;
  onEdit: (placeType: PlaceType) => void;
  onCancelEdit: () => void;
  onSaveEdit: (placeTypeId: string) => void;
  onDelete: (placeTypeId: string) => void;
  onFormDataChange: (data: PlaceTypeFormData) => void;
}

function PlaceTypeListItem({
  placeType,
  treeId,
  isEditing,
  editFormData,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onFormDataChange,
}: PlaceTypeListItemProps) {
  const { data: usageCount = 0 } = usePlaceTypeUsage(treeId, placeType.id);

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
          <h4>Editing Place Type</h4>
          <PlaceTypeForm
            formData={editFormData}
            onSubmit={(data) => {
              if (data !== editFormData) {
                onFormDataChange(data);
              } else {
                onSaveEdit(placeType.id);
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
            <strong style={{ fontSize: "18px" }}>{placeType.name}</strong>
            <div style={{ color: "#666", fontSize: "14px" }}>
              Used by {usageCount} place{usageCount !== 1 ? "s" : ""}
              <div style={{ fontSize: "12px", marginTop: "5px" }}>
                Created: {new Date(placeType.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => onEdit(placeType)}
              disabled={!!placeType.key}
              title={
                placeType.key
                  ? "Cannot edit system place type"
                  : "Edit this place type"
              }
              style={{
                backgroundColor: placeType.key ? "#ccc" : "#2196F3",
                color: "white",
                border: "none",
                padding: "5px 10px",
                fontSize: "12px",
                marginRight: "5px",
                cursor: placeType.key ? "not-allowed" : "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(placeType.id)}
              disabled={usageCount > 0 || !!placeType.key}
              title={
                placeType.key
                  ? "Cannot delete system place type"
                  : usageCount > 0
                    ? `Cannot delete: used by ${usageCount} places`
                    : "Delete this place type"
              }
              style={{
                backgroundColor:
                  usageCount > 0 || placeType.key ? "#ccc" : "#f44336",
                color: "white",
                border: "none",
                padding: "5px 10px",
                fontSize: "12px",
                cursor:
                  usageCount > 0 || placeType.key ? "not-allowed" : "pointer",
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

export default PlaceTypesPage;
