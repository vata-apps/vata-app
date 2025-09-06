import { Place, PlaceType, PlaceFormData } from "../lib/db/types";

interface PlaceFormProps {
  formData: PlaceFormData;
  placeTypes: PlaceType[];
  places: Place[];
  onSubmit: (data: PlaceFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  excludePlaceId?: string; // For edit mode to exclude self from parent options
}

export function PlaceForm({
  formData,
  placeTypes,
  places,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  excludePlaceId,
}: PlaceFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a place name");
      return;
    }
    if (!formData.typeId) {
      alert("Please select a place type");
      return;
    }
    onSubmit(formData);
  };

  const availablePlaces = excludePlaceId
    ? places.filter((p) => p.id !== excludePlaceId)
    : places;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "10px" }}>
        <label>Name: </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onSubmit({ ...formData, name: e.target.value })}
          placeholder="Enter place name..."
          style={{ padding: "5px", width: "200px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Type: </label>
        <select
          value={formData.typeId}
          onChange={(e) => onSubmit({ ...formData, typeId: e.target.value })}
          style={{ padding: "5px" }}
        >
          {placeTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Parent Place: </label>
        <select
          value={formData.parentId || ""}
          onChange={(e) =>
            onSubmit({ ...formData, parentId: e.target.value || null })
          }
          style={{ padding: "5px" }}
        >
          <option value="">None</option>
          {availablePlaces.map((place) => (
            <option key={place.id} value={place.id}>
              {place.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Latitude: </label>
        <input
          type="number"
          step="any"
          value={formData.latitude || ""}
          onChange={(e) =>
            onSubmit({
              ...formData,
              latitude: e.target.value ? parseFloat(e.target.value) : null,
            })
          }
          placeholder="Optional"
          style={{ padding: "5px", width: "100px" }}
        />
        <label style={{ marginLeft: "20px" }}>Longitude: </label>
        <input
          type="number"
          step="any"
          value={formData.longitude || ""}
          onChange={(e) =>
            onSubmit({
              ...formData,
              longitude: e.target.value ? parseFloat(e.target.value) : null,
            })
          }
          placeholder="Optional"
          style={{ padding: "5px", width: "100px" }}
        />
      </div>

      <button
        type="submit"
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "10px 20px",
          marginRight: "10px",
        }}
      >
        {submitLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: "#666",
            color: "white",
            border: "none",
            padding: "10px 20px",
          }}
        >
          Cancel
        </button>
      )}
    </form>
  );
}
