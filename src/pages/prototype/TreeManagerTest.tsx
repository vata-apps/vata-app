import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { treeManager } from "$managers";
import { system } from "$db";
import type { Tree, CreateTreeInput, UpdateTreeInput } from "$db";
import { exists, BaseDirectory } from "@tauri-apps/plugin-fs";

type TreeWithStatus = Tree & {
  fileExists: boolean;
  isOrphaned?: boolean;
};

export function TreeManagerTest() {
  const [trees, setTrees] = useState<TreeWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Simple state for unregistered files
  const [unregisteredFiles, setUnregisteredFiles] = useState<string[]>([]);
  const [showRepairSection, setShowRepairSection] = useState(false);

  // Modal state for registering files
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState<{
    filePath: string;
    treeName: string;
    description: string;
  }>({
    filePath: "",
    treeName: "",
    description: "",
  });

  // Create tree form state
  const [createForm, setCreateForm] = useState<CreateTreeInput>({
    name: "",
    description: "",
  });

  // Update tree form state
  const [updateForm, setUpdateForm] = useState<{
    id: string;
    data: UpdateTreeInput;
  }>({
    id: "",
    data: { name: "", description: "" },
  });

  /**
   * Load all trees from system database and check if files exist
   */
  const loadTrees = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("Loading trees...");

      await system.initializeSystemDatabase();
      const allTrees = await system.trees.getAllTrees();

      // Check if each tree's physical file exists and mark orphaned trees
      const treesWithFileStatus = await Promise.all(
        allTrees.map(async (tree) => {
          try {
            const fileExists = await exists(tree.file_path, {
              baseDir: BaseDirectory.AppData,
            });
            return { ...tree, fileExists, isOrphaned: !fileExists };
          } catch {
            return { ...tree, fileExists: false, isOrphaned: true };
          }
        }),
      );

      // Get unregistered files separately
      const unregistered = await treeManager.getUnregisteredFiles();

      setTrees(treesWithFileStatus);
      setUnregisteredFiles(unregistered);

      const orphanedCount = treesWithFileStatus.filter(
        (t) => t.isOrphaned,
      ).length;

      if (orphanedCount > 0 || unregistered.length > 0) {
        setMessage(
          `Loaded ${allTrees.length} trees. Found ${orphanedCount} orphaned trees and ${unregistered.length} unregistered files.`,
        );
        setShowRepairSection(true);
      } else {
        setMessage(`Loaded ${allTrees.length} trees. No issues found.`);
        setShowRepairSection(false);
      }
    } catch (error) {
      setMessage(
        `Error loading trees: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new tree
   */
  const handleCreateTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setMessage("Tree name is required");
      return;
    }

    try {
      setLoading(true);
      const newTree = await treeManager.createNewTree(createForm);
      setMessage(
        `Successfully created tree: ${newTree.name} (ID: ${newTree.id})`,
      );
      setCreateForm({ name: "", description: "" });
      await loadTrees();
    } catch (error) {
      setMessage(
        `Error creating tree: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing tree
   */
  const handleUpdateTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateForm.id.trim()) {
      setMessage("Tree ID is required for update");
      return;
    }

    // Only send fields that are actually filled in
    const updateData: UpdateTreeInput = {};
    if (updateForm.data.name && updateForm.data.name.trim()) {
      updateData.name = updateForm.data.name.trim();
    }
    if (updateForm.data.description && updateForm.data.description.trim()) {
      updateData.description = updateForm.data.description.trim();
    }

    if (Object.keys(updateData).length === 0) {
      setMessage("Please provide at least one field to update");
      return;
    }

    try {
      setLoading(true);
      const updatedTree = await treeManager.updateTree(
        updateForm.id,
        updateData,
      );
      setMessage(`Successfully updated tree: ${updatedTree.name}`);
      setUpdateForm({ id: "", data: { name: "", description: "" } });
      await loadTrees();
    } catch (error) {
      setMessage(
        `Error updating tree: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a tree
   */
  const handleDeleteTree = async (treeId: string) => {
    try {
      setLoading(true);
      await treeManager.deleteCompleteTree(treeId);
      setMessage(`Successfully deleted tree ID: ${treeId}`);
      await loadTrees();
    } catch (error) {
      setMessage(
        `Error deleting tree: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove an orphaned tree from database
   */
  const handleRemoveOrphanedTree = async (treeId: string) => {
    try {
      setLoading(true);
      await treeManager.removeOrphanedTree(treeId);
      setMessage(`Successfully removed orphaned tree ID: ${treeId}`);
      await loadTrees();
    } catch (error) {
      setMessage(
        `Error removing orphaned tree: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open register modal for a file
   */
  const handleRegisterFile = (filePath: string) => {
    setRegisterForm({
      filePath,
      treeName: "",
      description: "",
    });
    setShowRegisterModal(true);
  };

  /**
   * Register an unregistered file from modal
   */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerForm.treeName.trim()) {
      setMessage("Tree name is required");
      return;
    }

    try {
      setLoading(true);
      setShowRegisterModal(false);

      const newTree = await treeManager.registerUnregisteredFile(
        registerForm.filePath,
        registerForm.treeName.trim(),
        registerForm.description.trim() || undefined,
      );

      setMessage(
        `Successfully registered file as tree: ${newTree.name} (ID: ${newTree.id})`,
      );
      await loadTrees();
    } catch (error) {
      setMessage(
        `Error registering file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel register modal
   */
  const handleRegisterCancel = () => {
    setShowRegisterModal(false);
    setRegisterForm({
      filePath: "",
      treeName: "",
      description: "",
    });
  };

  useEffect(() => {
    loadTrees();
  }, [loadTrees]);

  return (
    <div>
      <h1>Tree Manager Test Interface</h1>

      {message && <div>{message}</div>}

      {loading && (
        <p>
          <strong>Loading...</strong>
        </p>
      )}

      <hr />

      <h2>Create New Tree</h2>
      <form onSubmit={handleCreateTree}>
        <div>
          <label>Name: </label>
          <input
            type="text"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm({ ...createForm, name: e.target.value })
            }
            placeholder="Enter tree name"
            required
          />
        </div>
        <div>
          <label>Description: </label>
          <input
            type="text"
            value={createForm.description || ""}
            onChange={(e) =>
              setCreateForm({ ...createForm, description: e.target.value })
            }
            placeholder="Enter description (optional)"
          />
        </div>
        <button type="submit" disabled={loading}>
          Create Tree
        </button>
      </form>

      <hr />

      <h2>Update Tree</h2>
      <form onSubmit={handleUpdateTree}>
        <div>
          <label>Tree ID: </label>
          <input
            type="text"
            value={updateForm.id}
            onChange={(e) =>
              setUpdateForm({ ...updateForm, id: e.target.value })
            }
            placeholder="Enter tree ID"
            required
          />
        </div>
        <div>
          <label>New Name: </label>
          <input
            type="text"
            value={updateForm.data.name || ""}
            onChange={(e) =>
              setUpdateForm({
                ...updateForm,
                data: { ...updateForm.data, name: e.target.value },
              })
            }
            placeholder="Enter new name (optional)"
          />
        </div>
        <div>
          <label>New Description: </label>
          <input
            type="text"
            value={updateForm.data.description || ""}
            onChange={(e) =>
              setUpdateForm({
                ...updateForm,
                data: { ...updateForm.data, description: e.target.value },
              })
            }
            placeholder="Enter new description (optional)"
          />
        </div>
        <button type="submit" disabled={loading}>
          Update Tree
        </button>
      </form>

      <hr />

      <h2>Existing Trees</h2>
      {trees.length === 0 ? (
        <p>No trees found. Create one above!</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>File Path</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trees.map((tree) => (
              <tr key={tree.id}>
                <td>{tree.id}</td>
                <td>
                  {tree.isOrphaned ? (
                    tree.name
                  ) : (
                    <Link
                      to="/tree/$treeId"
                      params={{ treeId: tree.id }}
                      style={{ textDecoration: "underline", color: "blue" }}
                    >
                      {tree.name}
                    </Link>
                  )}
                </td>
                <td>{tree.description || "-"}</td>
                <td>{tree.file_path}</td>
                <td
                  style={{
                    color: tree.isOrphaned ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  {tree.isOrphaned ? "⚠️ Orphaned" : "✓ OK"}
                </td>
                <td>{tree.created_at.toLocaleString()}</td>
                <td>
                  {tree.isOrphaned ? (
                    <button
                      onClick={() => handleRemoveOrphanedTree(tree.id)}
                      disabled={loading}
                      style={{ color: "red" }}
                    >
                      Remove from DB
                    </button>
                  ) : (
                    <>
                      <Link to="/tree/$treeId" params={{ treeId: tree.id }}>
                        <button
                          disabled={loading}
                          style={{ marginRight: "5px" }}
                        >
                          Open
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteTree(tree.id)}
                        disabled={loading}
                        style={{ color: "red" }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showRepairSection && (
        <>
          <hr />
          <h2>Database Repair</h2>

          {unregisteredFiles.length > 0 && (
            <div>
              <h3>Unregistered Files ({unregisteredFiles.length})</h3>
              <p>
                These database files exist but are not registered in the system:
              </p>
              <ul>
                {unregisteredFiles.map((filePath, index) => (
                  <li key={index}>
                    {filePath}
                    <button
                      onClick={() => handleRegisterFile(filePath)}
                      disabled={loading}
                      style={{ marginLeft: "10px", color: "blue" }}
                    >
                      Register
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <hr />

      <h2>Quick Actions</h2>
      <button onClick={loadTrees} disabled={loading}>
        Refresh Trees List
      </button>

      {/* Register File Modal */}
      {showRegisterModal && (
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
              minWidth: "400px",
              maxWidth: "600px",
            }}
          >
            <h3>Register Unregistered File</h3>
            <p>
              <strong>File:</strong> {registerForm.filePath}
            </p>

            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Tree Name: *
                </label>
                <input
                  type="text"
                  value={registerForm.treeName}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      treeName: e.target.value,
                    })
                  }
                  placeholder="Enter tree name"
                  required
                  style={{ width: "100%", padding: "8px", fontSize: "14px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Description (optional):
                </label>
                <input
                  type="text"
                  value={registerForm.description}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter description"
                  style={{ width: "100%", padding: "8px", fontSize: "14px" }}
                />
              </div>

              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  onClick={handleRegisterCancel}
                  disabled={loading}
                  style={{
                    marginRight: "10px",
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
