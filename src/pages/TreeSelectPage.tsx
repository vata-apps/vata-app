import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trees } from "../lib/trees";

function TreeSelectPage() {
  const [newTreeName, setNewTreeName] = useState("");
  const [newTreeDescription, setNewTreeDescription] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: treesList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trees"],
    queryFn: () => trees.list(),
  });

  const createTreeMutation = useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => trees.create(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trees"] });
      setNewTreeName("");
      setNewTreeDescription("");
    },
  });

  const deleteTreeMutation = useMutation({
    mutationFn: (name: string) => trees.delete(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trees"] });
    },
  });

  const openTreeMutation = useMutation({
    mutationFn: (name: string) => trees.updateLastOpened(name),
    onSuccess: (_, treeName) => {
      queryClient.invalidateQueries({ queryKey: ["trees"] });
      navigate({ to: "/$treeId", params: { treeId: treeName } });
    },
  });

  async function createTree() {
    if (!newTreeName.trim()) {
      return;
    }

    createTreeMutation.mutate({
      name: newTreeName,
      description: newTreeDescription.trim() || undefined,
    });
  }

  async function deleteTree(name: string) {
    // TODO: Replace with proper Tauri dialog API
    // For now, skip confirmation - direct deletion
    deleteTreeMutation.mutate(name);
  }

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

      <div style={{ marginBottom: "30px" }}>
        <h2>Create New Tree</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTree();
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
            {treesList.map((tree) => (
              <div
                key={tree.name}
                style={{
                  padding: "15px",
                  border: tree.fileExists
                    ? "1px solid #ccc"
                    : "1px solid #f44336",
                  marginBottom: "10px",
                  backgroundColor: tree.fileExists ? "white" : "#ffe6e6",
                }}
              >
                <h3>{tree.name}</h3>
                {tree.description && (
                  <p>
                    <strong>Description:</strong> {tree.description}
                  </p>
                )}
                <p>Path: {tree.path}</p>
                <p>Created: {new Date(tree.created_at).toLocaleDateString()}</p>

                {!tree.fileExists && (
                  <p style={{ color: "#d00", fontWeight: "bold" }}>
                    ⚠️ Database file not found!
                  </p>
                )}

                <button
                  onClick={() => openTreeMutation.mutate(tree.name)}
                  disabled={!tree.fileExists || openTreeMutation.isPending}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: tree.fileExists ? "#4CAF50" : "#ccc",
                    color: "white",
                    border: "none",
                    marginRight: "10px",
                    cursor: tree.fileExists ? "pointer" : "not-allowed",
                    opacity: openTreeMutation.isPending ? 0.5 : 1,
                  }}
                >
                  {openTreeMutation.isPending
                    ? "Opening..."
                    : tree.fileExists
                      ? "Open Tree"
                      : "Unavailable"}
                </button>

                <button
                  onClick={() => deleteTree(tree.name)}
                  disabled={deleteTreeMutation.isPending}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    opacity: deleteTreeMutation.isPending ? 0.5 : 1,
                  }}
                >
                  {deleteTreeMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TreeSelectPage;
