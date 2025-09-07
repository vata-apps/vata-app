import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useTrees,
  useCreateTree,
  useDeleteTree,
  useUpdateLastOpened,
  useRebuildDbEntry,
} from "../hooks/use-trees-query";

function TreeSelectPage() {
  const [newTreeName, setNewTreeName] = useState("");
  const [newTreeDescription, setNewTreeDescription] = useState("");
  const navigate = useNavigate();

  const { data: treesList = [], isLoading, error } = useTrees();

  const createTreeMutation = useCreateTree();
  const deleteTreeMutation = useDeleteTree();
  const openTreeMutation = useUpdateLastOpened();
  const rebuildDbMutation = useRebuildDbEntry();

  const handleCreateTree = () => {
    if (!newTreeName.trim()) return;

    createTreeMutation.mutate(
      {
        name: newTreeName,
        description: newTreeDescription.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNewTreeName("");
          setNewTreeDescription("");
        },
      },
    );
  };

  const handleDeleteTree = (name: string) => {
    deleteTreeMutation.mutate(name);
  };

  const handleRebuildTree = (name: string) => {
    rebuildDbMutation.mutate(name);
  };

  if (isLoading) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Vata Genealogy</h1>
        <p>Loading trees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Vata Genealogy</h1>
        <div
          style={{
            color: "red",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            marginBottom: "20px",
          }}
        >
          <h3>Error loading trees:</h3>
          <p>
            <strong>Message:</strong> {error.message}
          </p>
          <p>
            <strong>Stack:</strong>
          </p>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {error.stack}
          </pre>
          <p>
            <strong>Full error:</strong>
          </p>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Vata Genealogy</h1>
      <p>Select a family tree to work with, or create a new one.</p>

      {createTreeMutation.error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#ffe6e6",
            color: "#d00",
            marginBottom: "20px",
          }}
        >
          Error creating tree: {createTreeMutation.error.message}
        </div>
      )}

      {deleteTreeMutation.error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#ffe6e6",
            color: "#d00",
            marginBottom: "20px",
          }}
        >
          Error deleting tree: {deleteTreeMutation.error.message}
        </div>
      )}

      {rebuildDbMutation.error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#ffe6e6",
            color: "#d00",
            marginBottom: "20px",
          }}
        >
          Error rebuilding tree: {rebuildDbMutation.error.message}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h2>Create New Tree</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateTree();
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              value={newTreeName}
              onChange={(e) => setNewTreeName(e.target.value)}
              placeholder="Enter tree name..."
              style={{ marginRight: "10px", padding: "5px", width: "200px" }}
              disabled={createTreeMutation.isPending}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              value={newTreeDescription}
              onChange={(e) => setNewTreeDescription(e.target.value)}
              placeholder="Optional description..."
              style={{ marginRight: "10px", padding: "5px", width: "300px" }}
              disabled={createTreeMutation.isPending}
            />
          </div>
          <button
            type="submit"
            disabled={createTreeMutation.isPending || !newTreeName.trim()}
          >
            {createTreeMutation.isPending ? "Creating..." : "Create Tree"}
          </button>
        </form>
      </div>

      <div>
        <h2>Available Trees ({treesList.length})</h2>
        {treesList.length === 0 ? (
          <p>No trees found. Create one above!</p>
        ) : (
          <div>
            {treesList.map((tree) => {
              const getStatusColor = () => {
                switch (tree.status) {
                  case "healthy":
                    return "#4CAF50";
                  case "file_missing":
                    return "#ff9800";
                  case "db_missing":
                    return "#f44336";
                  default:
                    return "#ccc";
                }
              };

              const getStatusMessage = () => {
                switch (tree.status) {
                  case "healthy":
                    return "✅ Arbre en bonne santé";
                  case "file_missing":
                    return "⚠️ Fichier de base de données manquant";
                  case "db_missing":
                    return "🔧 Entrée de base de données manquante";
                  default:
                    return "";
                }
              };

              return (
                <div
                  key={tree.name}
                  style={{
                    padding: "15px",
                    border: `2px solid ${getStatusColor()}`,
                    marginBottom: "10px",
                    backgroundColor:
                      tree.status === "healthy" ? "white" : "#fff3e0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h3>{tree.name}</h3>
                      {tree.description && (
                        <p>
                          <strong>Description:</strong> {tree.description}
                        </p>
                      )}
                      <p>Path: {tree.path}</p>
                      <p>
                        Created:{" "}
                        {new Date(tree.created_at).toLocaleDateString()}
                      </p>

                      <div
                        style={{
                          color: getStatusColor(),
                          fontWeight: "bold",
                          marginTop: "10px",
                        }}
                      >
                        {getStatusMessage()}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "15px" }}>
                    {tree.status === "healthy" && (
                      <>
                        <button
                          onClick={() =>
                            openTreeMutation.mutate(tree.name, {
                              onSuccess: () => {
                                navigate({
                                  to: "/$treeId",
                                  params: { treeId: tree.name },
                                });
                              },
                            })
                          }
                          disabled={openTreeMutation.isPending}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            marginRight: "10px",
                            cursor: "pointer",
                            opacity: openTreeMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          {openTreeMutation.isPending
                            ? "Opening..."
                            : "Open Tree"}
                        </button>
                        <button
                          onClick={() => handleDeleteTree(tree.name)}
                          disabled={deleteTreeMutation.isPending}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            marginRight: "10px",
                            opacity: deleteTreeMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          {deleteTreeMutation.isPending
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </>
                    )}

                    {tree.status === "file_missing" && (
                      <>
                        <button
                          disabled
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#ccc",
                            color: "#666",
                            border: "none",
                            marginRight: "10px",
                            cursor: "not-allowed",
                          }}
                        >
                          Import File (Disabled)
                        </button>
                        <button
                          onClick={() => handleDeleteTree(tree.name)}
                          disabled={deleteTreeMutation.isPending}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            marginRight: "10px",
                            opacity: deleteTreeMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          {deleteTreeMutation.isPending
                            ? "Deleting..."
                            : "Delete Entry"}
                        </button>
                      </>
                    )}

                    {tree.status === "db_missing" && (
                      <>
                        <button
                          onClick={() => handleRebuildTree(tree.name)}
                          disabled={rebuildDbMutation.isPending}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "none",
                            marginRight: "10px",
                            opacity: rebuildDbMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          {rebuildDbMutation.isPending
                            ? "Rebuilding..."
                            : "Rebuild Tree"}
                        </button>
                        <button
                          onClick={() => handleDeleteTree(tree.name)}
                          disabled={deleteTreeMutation.isPending}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            marginRight: "10px",
                            opacity: deleteTreeMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          {deleteTreeMutation.isPending
                            ? "Deleting..."
                            : "Delete File"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TreeSelectPage;
