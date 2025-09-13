import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  useIndividualsWithNames,
  useCreateIndividual,
  useUpdateIndividual,
  useDeleteIndividual,
  useCreateName,
} from "../hooks/use-individuals-query";
import {
  Individual,
  CreateIndividualInput,
  UpdateIndividualInput,
  GenderType,
  NameType,
} from "../lib/db/types";

function IndividualsPage() {
  const { treeId } = useParams({ from: "/$treeId/individuals" });

  const {
    data: individualsList = [],
    isLoading: individualsLoading,
    error: individualsError,
    refetch: refetchIndividuals,
  } = useIndividualsWithNames(treeId);

  const createIndividualMutation = useCreateIndividual(treeId);
  const updateIndividualMutation = useUpdateIndividual(treeId);
  const deleteIndividualMutation = useDeleteIndividual(treeId);
  const createNameMutation = useCreateName(treeId);

  const createEmptyFormData = (): CreateIndividualInput => ({
    gender: "unknown",
  });

  interface NameFormData {
    type: NameType;
    firstName: string;
    lastName: string;
    isPrimary: boolean;
  }

  interface IndividualFormData {
    individual: CreateIndividualInput;
    names: NameFormData[];
  }

  const createEmptyName = (isPrimary = false): NameFormData => ({
    type: "birth",
    firstName: "",
    lastName: "",
    isPrimary,
  });

  const createEmptyFormWithName = (): IndividualFormData => ({
    individual: createEmptyFormData(),
    names: [createEmptyName(true)], // First name entry is primary by default
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIndividual, setEditingIndividual] = useState<string | null>(
    null,
  );
  const [newIndividual, setNewIndividual] = useState<IndividualFormData>(
    createEmptyFormWithName(),
  );
  const [editIndividual, setEditIndividual] = useState<UpdateIndividualInput>(
    {},
  );

  const handleCreateIndividual = async (formData: IndividualFormData) => {
    createIndividualMutation.mutate(formData.individual, {
      onSuccess: async (createdIndividual) => {
        // Create all names for this individual
        const validNames = formData.names.filter(
          (name) => name.firstName.trim() || name.lastName.trim(),
        );

        // Ensure at least one name is marked as primary if there are names
        if (validNames.length > 0) {
          const hasPrimary = validNames.some((name) => name.isPrimary);
          if (!hasPrimary) {
            validNames[0].isPrimary = true;
          }
        }

        // Create each name
        validNames.forEach((name) => {
          createNameMutation.mutate({
            individualId: createdIndividual.id,
            type: name.type,
            firstName: name.firstName.trim() || null,
            lastName: name.lastName.trim() || null,
            isPrimary: name.isPrimary,
          });
        });

        setNewIndividual(createEmptyFormWithName());
        setShowCreateForm(false);
      },
    });
  };

  const handleDeleteIndividual = async (individualId: string) => {
    deleteIndividualMutation.mutate(individualId);
  };

  const addName = () => {
    setNewIndividual({
      ...newIndividual,
      names: [...newIndividual.names, createEmptyName()], // Added names are not primary by default
    });
  };

  const removeName = (index: number) => {
    const updatedNames = newIndividual.names.filter((_, i) => i !== index);
    // If no names remain, create a new primary name
    // Otherwise, if the primary name was removed, make the first remaining name primary
    let finalNames = updatedNames;
    if (finalNames.length === 0) {
      finalNames = [createEmptyName(true)];
    } else if (newIndividual.names[index].isPrimary) {
      // If the primary name was removed, make the first remaining name primary
      finalNames = finalNames.map((name, i) => ({
        ...name,
        isPrimary: i === 0,
      }));
    }

    setNewIndividual({
      ...newIndividual,
      names: finalNames,
    });
  };

  const updateName = (
    index: number,
    field: keyof NameFormData,
    value: string | boolean,
  ) => {
    const updatedNames = newIndividual.names.map((name, i) =>
      i === index ? { ...name, [field]: value } : name,
    );
    setNewIndividual({
      ...newIndividual,
      names: updatedNames,
    });
  };

  const setPrimary = (index: number) => {
    const updatedNames = newIndividual.names.map((name, i) => ({
      ...name,
      isPrimary: i === index,
    }));
    setNewIndividual({
      ...newIndividual,
      names: updatedNames,
    });
  };

  const startEditIndividual = (individual: Individual) => {
    setEditingIndividual(individual.id);
    setEditIndividual({
      gender: individual.gender,
    });
  };

  const cancelEdit = () => {
    setEditingIndividual(null);
    setEditIndividual({});
  };

  const saveEdit = async (individualId: string) => {
    updateIndividualMutation.mutate(
      {
        individualId,
        updates: editIndividual,
      },
      {
        onSuccess: () => {
          setEditingIndividual(null);
        },
      },
    );
  };

  if (individualsLoading) return <div>Loading individuals...</div>;
  if (individualsError)
    return (
      <div style={{ color: "red" }}>
        Error:{" "}
        {individualsError instanceof Error
          ? individualsError.message
          : String(individualsError)}
      </div>
    );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/$treeId" params={{ treeId }} style={{ color: "#666" }}>
          ← Back to {treeId}
        </Link>
      </div>

      <h1>Individuals in {treeId}</h1>

      <div style={{ marginBottom: "20px" }}>
        <p>Found {individualsList.length} individuals</p>
        <button
          onClick={() => refetchIndividuals()}
          style={{ marginRight: "10px" }}
        >
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
          {showCreateForm ? "Cancel" : "Create Individual"}
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
          <h3>Create New Individual</h3>
          <div>
            {/* Gender */}
            <div style={{ marginBottom: "20px" }}>
              <label>Gender:</label>
              <select
                value={newIndividual.individual.gender}
                onChange={(e) =>
                  setNewIndividual({
                    ...newIndividual,
                    individual: {
                      ...newIndividual.individual,
                      gender: e.target.value as GenderType,
                    },
                  })
                }
                style={{ marginLeft: "10px", padding: "5px" }}
              >
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Names */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h4>Names</h4>
                <button
                  type="button"
                  onClick={addName}
                  style={{
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    fontSize: "12px",
                  }}
                >
                  + Add Name
                </button>
              </div>

              {newIndividual.names.map((name, index) => (
                <div
                  key={index}
                  style={{
                    padding: "15px",
                    border: "1px solid #ddd",
                    marginBottom: "10px",
                    backgroundColor: name.isPrimary ? "#f0f8ff" : "#f9f9f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{ fontWeight: name.isPrimary ? "bold" : "normal" }}
                    >
                      Name {index + 1} {name.isPrimary && "(Primary)"}
                    </span>
                    {newIndividual.names.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeName(index)}
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "2px 8px",
                          fontSize: "11px",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

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
                        value={name.firstName}
                        onChange={(e) =>
                          updateName(index, "firstName", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "5px",
                          marginTop: "5px",
                        }}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label>Last Name:</label>
                      <input
                        type="text"
                        value={name.lastName}
                        onChange={(e) =>
                          updateName(index, "lastName", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "5px",
                          marginTop: "5px",
                        }}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "10px",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label>Type:</label>
                      <select
                        value={name.type}
                        onChange={(e) =>
                          updateName(index, "type", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "5px",
                          marginTop: "5px",
                        }}
                      >
                        <option value="birth">Birth</option>
                        <option value="marriage">Marriage</option>
                        <option value="nickname">Nickname</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    {!name.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimary(index)}
                        style={{
                          backgroundColor: "#FF9800",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          fontSize: "12px",
                        }}
                      >
                        Make Primary
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCreateIndividual(newIndividual)}
              disabled={
                createIndividualMutation.isPending ||
                createNameMutation.isPending
              }
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "10px 20px",
                marginRight: "10px",
              }}
            >
              {createIndividualMutation.isPending ||
              createNameMutation.isPending
                ? "Creating..."
                : "Create Individual"}
            </button>
          </div>
        </div>
      )}

      {/* Individuals List */}
      {individualsList.length === 0 ? (
        <p>No individuals found. Create your first individual!</p>
      ) : (
        <div>
          <h2>All Individuals</h2>
          <div>
            {individualsList.map((individual) => (
              <div
                key={individual.id}
                style={{
                  padding: "15px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                  backgroundColor: "white",
                }}
              >
                {editingIndividual === individual.id ? (
                  <div>
                    <h4>Editing Individual</h4>
                    <div style={{ marginBottom: "10px" }}>
                      <label>Gender:</label>
                      <select
                        value={editIndividual.gender ?? individual.gender}
                        onChange={(e) =>
                          setEditIndividual({
                            ...editIndividual,
                            gender: e.target.value as GenderType,
                          })
                        }
                        style={{ marginLeft: "10px", padding: "5px" }}
                      >
                        <option value="unknown">Unknown</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <button
                      onClick={() => saveEdit(individual.id)}
                      disabled={updateIndividualMutation.isPending}
                      style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        marginRight: "10px",
                      }}
                    >
                      {updateIndividualMutation.isPending
                        ? "Saving..."
                        : "Save"}
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
                      <Link
                        to="/$treeId/individuals/$individualId"
                        params={{ treeId, individualId: individual.id }}
                        style={{ textDecoration: "none" }}
                      >
                        <strong style={{ fontSize: "18px" }}>
                          {individual.primaryName
                            ? [
                                individual.primaryName.first_name,
                                individual.primaryName.last_name,
                              ]
                                .filter(Boolean)
                                .join(" ") || "Unnamed Individual"
                            : "Unnamed Individual"}
                        </strong>
                      </Link>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        Gender: {individual.gender}
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          Created:{" "}
                          {new Date(individual.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => startEditIndividual(individual)}
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
                        onClick={() => handleDeleteIndividual(individual.id)}
                        disabled={deleteIndividualMutation.isPending}
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          fontSize: "12px",
                        }}
                      >
                        {deleteIndividualMutation.isPending ? "..." : "Delete"}
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

export default IndividualsPage;
