import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  usePlaces,
  useCreatePlace,
  useUpdatePlace,
  useDeletePlace,
} from "../hooks/use-places-query";
import { usePlaceTypes } from "../hooks/use-place-types-query";
import { PlaceForm } from "../components/PlaceForm";
import { Place, PlaceInput } from "../lib/db/types";

function PlacesPage() {
  const { treeId } = useParams({ from: "/$treeId/places" });

  const {
    data: placesList = [],
    isLoading: placesLoading,
    error: placesError,
    refetch: refetchPlaces,
  } = usePlaces(treeId);
  const {
    data: placeTypes = [],
    isLoading: typesLoading,
    error: typesError,
  } = usePlaceTypes(treeId);
  const createPlaceMutation = useCreatePlace(treeId);
  const updatePlaceMutation = useUpdatePlace(treeId);
  const deletePlaceMutation = useDeletePlace(treeId);

  const loading = placesLoading || typesLoading;
  const error = placesError || typesError;

  const createEmptyFormData = (defaultTypeId = ""): PlaceInput => ({
    name: "",
    typeId: defaultTypeId,
    parentId: null,
    latitude: null,
    longitude: null,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<string | null>(null);
  const [newPlace, setNewPlace] = useState<PlaceInput>(createEmptyFormData());
  const [editPlace, setEditPlace] = useState<PlaceInput>(createEmptyFormData());

  const handleCreatePlace = async (formData: PlaceInput) => {
    createPlaceMutation.mutate(
      {
        ...formData,
        gedcomId: null,
      },
      {
        onSuccess: () => {
          setNewPlace(createEmptyFormData(placeTypes[0]?.id || ""));
          setShowCreateForm(false);
        },
      },
    );
  };

  const handleDeletePlace = async (placeId: string) => {
    deletePlaceMutation.mutate(placeId);
  };

  const startEditPlace = (place: Place) => {
    setEditingPlace(place.id);
    setEditPlace({
      name: place.name,
      typeId: place.type_id,
      parentId: place.parent_id,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  const cancelEdit = () => {
    setEditingPlace(null);
    setEditPlace(createEmptyFormData());
  };

  const saveEdit = async (placeId: string) => {
    updatePlaceMutation.mutate(
      {
        placeId,
        updates: editPlace,
      },
      {
        onSuccess: () => {
          setEditingPlace(null);
        },
      },
    );
  };

  if (loading) return <div>Loading places...</div>;
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

      <h1>Places in {treeId}</h1>

      <div style={{ marginBottom: "20px" }}>
        <p>Found {placesList.length} places</p>
        <button onClick={() => refetchPlaces()} style={{ marginRight: "10px" }}>
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
          {showCreateForm ? "Cancel" : "Create Place"}
        </button>
        <Link
          to="/$treeId/settings/place-types"
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
          Manage Place Types
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
          <h3>Create New Place</h3>
          <PlaceForm
            formData={newPlace}
            placeTypes={placeTypes}
            places={placesList}
            onSubmit={(data) => {
              if (data !== newPlace) {
                setNewPlace(data);
              } else {
                handleCreatePlace(data);
              }
            }}
            submitLabel="Create Place"
          />
        </div>
      )}

      {/* Places List */}
      {placesList.length === 0 ? (
        <p>No places found. Create your first place!</p>
      ) : (
        <div>
          <h2>All Places</h2>
          <div>
            {placesList.map((place) => (
              <div
                key={place.id}
                style={{
                  padding: "15px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  backgroundColor: "white",
                }}
              >
                {editingPlace === place.id ? (
                  <div>
                    <h4>Editing Place</h4>
                    <PlaceForm
                      formData={editPlace}
                      placeTypes={placeTypes}
                      places={placesList}
                      onSubmit={(data) => {
                        if (data !== editPlace) {
                          setEditPlace(data);
                        } else {
                          saveEdit(place.id);
                        }
                      }}
                      onCancel={cancelEdit}
                      submitLabel="Save"
                      excludePlaceId={place.id}
                    />
                  </div>
                ) : (
                  // View Mode
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Link
                        to="/$treeId/places/$placeId"
                        params={{ treeId, placeId: place.id }}
                        style={{ textDecoration: "none" }}
                      >
                        <strong style={{ fontSize: "18px" }}>
                          {place.name}
                        </strong>
                      </Link>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        Type:{" "}
                        {placeTypes.find((t) => t.id === place.type_id)?.name ||
                          `ID: ${place.type_id}`}
                        {place.parent_id && ` • Parent ID: ${place.parent_id}`}
                        {place.latitude &&
                          place.longitude &&
                          ` • ${place.latitude}, ${place.longitude}`}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => startEditPlace(place)}
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
                        onClick={() => handleDeletePlace(place.id)}
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
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlacesPage;
