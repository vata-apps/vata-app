import { useState, useEffect } from "react";
import { treeManager } from "$managers";
import { system } from "$db";
import type { Tree, CreateTreeInput, UpdateTreeInput } from "$db";
import { exists, BaseDirectory } from "@tauri-apps/plugin-fs";

export function TreeManagerTest() {
  const [trees, setTrees] = useState<(Tree & { fileExists: boolean })[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
  const loadTrees = async () => {
    try {
      setLoading(true);
      await system.initializeSystemDatabase();
      const allTrees = await system.trees.getAllTrees();

      // Check if each tree's physical file exists
      const treesWithFileStatus = await Promise.all(
        allTrees.map(async (tree) => {
          try {
            const fileExists = await exists(tree.file_path, {
              baseDir: BaseDirectory.AppData,
            });
            return { ...tree, fileExists };
          } catch {
            return { ...tree, fileExists: false };
          }
        }),
      );

      setTrees(treesWithFileStatus);
      setMessage(`Loaded ${allTrees.length} trees`);
    } catch (error) {
      setMessage(
        `Error loading trees: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadTrees();
  }, []);

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
              <th>File Exists</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trees.map((tree) => (
              <tr key={tree.id}>
                <td>{tree.id}</td>
                <td>{tree.name}</td>
                <td>{tree.description || "-"}</td>
                <td>{tree.file_path}</td>
                <td
                  style={{
                    color: tree.fileExists ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {tree.fileExists ? "✓ Yes" : "✗ No"}
                </td>
                <td>{tree.created_at.toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => handleDeleteTree(tree.id)}
                    disabled={loading}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      <h2>Quick Actions</h2>
      <button onClick={loadTrees} disabled={loading}>
        Refresh Trees List
      </button>
    </div>
  );
}
