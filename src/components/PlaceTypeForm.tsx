interface PlaceTypeFormData {
  name: string;
}

interface PlaceTypeFormProps {
  formData: PlaceTypeFormData;
  onSubmit: (data: PlaceTypeFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function PlaceTypeForm({
  formData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: PlaceTypeFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a place type name");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "10px" }}>
        <label>Name: </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onSubmit({ ...formData, name: e.target.value })}
          placeholder="Enter place type name..."
          style={{ padding: "5px", width: "200px" }}
          required
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
