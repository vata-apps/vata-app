import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  useIndividualWithNames,
  useCreateName,
  useUpdateName,
  useDeleteName,
} from "../hooks/use-individuals-query";
import {
  CreateNameInput,
  UpdateNameInput,
  NameType,
  Name,
} from "../lib/db/types";

function IndividualPage() {
  const { treeId, individualId } = useParams({
    from: "/$treeId/individuals/$individualId",
  });

  const {
    data: individualWithNames,
    isLoading,
    error,
  } = useIndividualWithNames(treeId, individualId);

  const createNameMutation = useCreateName(treeId);
  const updateNameMutation = useUpdateName(treeId);
  const deleteNameMutation = useDeleteName(treeId);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<Omit<CreateNameInput, "individualId">>(
    {
      type: "birth",
      firstName: "",
      lastName: "",
      isPrimary: false,
    },
  );
  const [editName, setEditName] = useState<UpdateNameInput>({});

  const handleCreateName = async () => {
    const nameData: CreateNameInput = {
      ...newName,
      individualId,
    };

    createNameMutation.mutate(nameData, {
      onSuccess: () => {
        setNewName({
          type: "birth",
          firstName: "",
          lastName: "",
          isPrimary: false,
        });
        setShowCreateForm(false);
      },
    });
  };

  const handleDeleteName = async (nameId: string) => {
    deleteNameMutation.mutate({ nameId, individualId });
  };

  const startEditName = (name: Name) => {
    setEditingName(name.id);
    setEditName({
      type: name.type,
      firstName: name.first_name,
      lastName: name.last_name,
      isPrimary: name.is_primary,
    });
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditName({});
  };

  const saveEdit = async (nameId: string) => {
    updateNameMutation.mutate(
      {
        nameId,
        updates: editName,
      },
      {
        onSuccess: () => {
          setEditingName(null);
        },
      },
    );
  };

  if (isLoading) return <div>Loading individual...</div>;
  if (error)
    return (
      <div style={{ color: "red" }}>
        Error: {error instanceof Error ? error.message : String(error)}
      </div>
    );

  if (!individualWithNames) {
    return <div>Individual not found</div>;
  }

  const individual = individualWithNames;
  const names = individual.names || [];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/$treeId/individuals"
          params={{ treeId }}
          style={{ color: "#666" }}
        >
          ← Back to Individuals
        </Link>
      </div>

      <h1>Individual Details</h1>

      {/* Individual Info */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          backgroundColor: "white",
        }}
      >
        <h2>Basic Information</h2>
        <div style={{ color: "#666" }}>
          <p>
            <strong>ID:</strong> {individual.id}
          </p>
          <p>
            <strong>Gender:</strong> {individual.gender}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(individual.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Names Section */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>Names ({names.length})</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              backgroundColor: showCreateForm ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              padding: "8px 16px",
            }}
          >
            {showCreateForm ? "Cancel" : "Add Name"}
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
            <h3>Add New Name</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div>
                <label>First Name:</label>
                <input
                  type="text"
                  value={newName.firstName || ""}
                  onChange={(e) =>
                    setNewName({ ...newName, firstName: e.target.value })
                  }
                  style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                />
              </div>
              <div>
                <label>Last Name:</label>
                <input
                  type="text"
                  value={newName.lastName || ""}
                  onChange={(e) =>
                    setNewName({ ...newName, lastName: e.target.value })
                  }
                  style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                />
              </div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Type:</label>
              <select
                value={newName.type}
                onChange={(e) =>
                  setNewName({ ...newName, type: e.target.value as NameType })
                }
                style={{ marginLeft: "10px", padding: "5px" }}
              >
                <option value="birth">Birth</option>
                <option value="marriage">Marriage</option>
                <option value="nickname">Nickname</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={newName.isPrimary || false}
                  onChange={(e) =>
                    setNewName({ ...newName, isPrimary: e.target.checked })
                  }
                  style={{ marginRight: "5px" }}
                />
                Primary Name
              </label>
            </div>
            <button
              onClick={handleCreateName}
              disabled={createNameMutation.isPending}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "10px 20px",
              }}
            >
              {createNameMutation.isPending ? "Adding..." : "Add Name"}
            </button>
          </div>
        )}

        {/* Names List */}
        {names.length === 0 ? (
          <p>No names found. Add the first name for this individual!</p>
        ) : (
          <div>
            {names.map((name) => (
              <div
                key={name.id}
                style={{
                  padding: "15px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  backgroundColor: name.is_primary ? "#f0f8ff" : "white",
                  borderLeft: name.is_primary
                    ? "4px solid #2196F3"
                    : "1px solid #ccc",
                }}
              >
                {editingName === name.id ? (
                  <div>
                    <h4>Editing Name</h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <label>First Name:</label>
                        <input
                          type="text"
                          value={editName.firstName ?? (name.first_name || "")}
                          onChange={(e) =>
                            setEditName({
                              ...editName,
                              firstName: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "5px",
                            marginTop: "5px",
                          }}
                        />
                      </div>
                      <div>
                        <label>Last Name:</label>
                        <input
                          type="text"
                          value={editName.lastName ?? (name.last_name || "")}
                          onChange={(e) =>
                            setEditName({
                              ...editName,
                              lastName: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "5px",
                            marginTop: "5px",
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label>Type:</label>
                      <select
                        value={editName.type ?? name.type}
                        onChange={(e) =>
                          setEditName({
                            ...editName,
                            type: e.target.value as NameType,
                          })
                        }
                        style={{ marginLeft: "10px", padding: "5px" }}
                      >
                        <option value="birth">Birth</option>
                        <option value="marriage">Marriage</option>
                        <option value="nickname">Nickname</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={editName.isPrimary ?? name.is_primary}
                          onChange={(e) =>
                            setEditName({
                              ...editName,
                              isPrimary: e.target.checked,
                            })
                          }
                          style={{ marginRight: "5px" }}
                        />
                        Primary Name
                      </label>
                    </div>
                    <button
                      onClick={() => saveEdit(name.id)}
                      disabled={updateNameMutation.isPending}
                      style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        marginRight: "10px",
                      }}
                    >
                      {updateNameMutation.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        backgroundColor: "#ccc",
                        color: "black",
                        border: "none",
                        padding: "8px 16px",
                      }}
                    >
                      Cancel
                    </button>
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
                      <div style={{ fontSize: "18px" }}>
                        <strong>
                          {[name.first_name, name.last_name]
                            .filter(Boolean)
                            .join(" ") || "No name"}
                        </strong>
                        {name.is_primary && (
                          <span
                            style={{
                              backgroundColor: "#2196F3",
                              color: "white",
                              padding: "2px 8px",
                              borderRadius: "3px",
                              fontSize: "12px",
                              marginLeft: "10px",
                            }}
                          >
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        Type: {name.type}
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          Created:{" "}
                          {new Date(name.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => startEditName(name)}
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
                        onClick={() => handleDeleteName(name.id)}
                        disabled={deleteNameMutation.isPending}
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          fontSize: "12px",
                        }}
                      >
                        {deleteNameMutation.isPending ? "..." : "Delete"}
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

export default IndividualPage;
