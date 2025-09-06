import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { usePlaces } from "../hooks/usePlaces";
import { PlaceForm } from "../components/PlaceForm";
import { PlaceFormData } from "../lib/db/types";

function PlacesPage() {
  const { treeId } = useParams({ from: "/$treeId/places" });
  const { placesList, placeTypes, loading, error, loadData, createPlace, updatePlace, deletePlace } = usePlaces(treeId);

  const createEmptyFormData = (defaultTypeId = ""): PlaceFormData => ({
    name: "",
    typeId: defaultTypeId,
    parentId: null,
    latitude: null,
    longitude: null,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<string | null>(null);
  const [newPlace, setNewPlace] = useState<PlaceFormData>(createEmptyFormData());
  const [editPlace, setEditPlace] = useState<PlaceFormData>(createEmptyFormData());

  const handleCreatePlace = async (formData: PlaceFormData) => {
    try {
      await createPlace(formData);
      setNewPlace(createEmptyFormData(placeTypes[0]?.id || ""));
      setShowCreateForm(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    try {
      await deletePlace(placeId);
    } catch {
      // Error handled by hook
    }
  };

  const startEditPlace = (place: any) => {
    setEditingPlace(place.id);
    setEditPlace({
      name: place.name,
      typeId: place.typeId,
      parentId: place.parentId,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  const cancelEdit = () => {
    setEditingPlace(null);
    setEditPlace(createEmptyFormData());
  };

  const saveEdit = async (placeId: string) => {
    try {
      await updatePlace(placeId, editPlace);
      setEditingPlace(null);
    } catch {
      // Error handled by hook
    }
  };

  if (loading) return <div>Loading places...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

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
        <button onClick={loadData} style={{ marginRight: "10px" }}>
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
          {showCreateForm ? "Cancel" : "Create Place"}
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
                        {placeTypes.find((t) => t.id === place.typeId)?.name ||
                          `ID: ${place.typeId}`}
                        {place.parentId && ` • Parent ID: ${place.parentId}`}
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

      <div style={{ marginTop: "30px" }}>
        <h3>Available Place Types</h3>
        <ul>
          {placeTypes.map((type) => (
            <li key={type.id}>
              {type.name} (ID: {type.id}){" "}
              {type.isSystem ? "(System)" : "(Custom)"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PlacesPage;
