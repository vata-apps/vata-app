import { useState, useEffect } from "react";
import { Link } from '@tanstack/react-router'
import { trees, TreeInfo } from "../lib/trees";

function TreeSelectPage() {
  const [treesList, setTreesList] = useState<TreeInfo[]>([]);
  const [newTreeName, setNewTreeName] = useState("");
  const [message, setMessage] = useState("");

  // Load trees on startup
  useEffect(() => {
    loadTrees();
  }, []);

  async function loadTrees() {
    try {
      const treeList = await trees.list();
      setTreesList(treeList);
      setMessage(`Found ${treeList.length} trees`);
    } catch (error) {
      setMessage(`Error loading trees: ${error}`);
    }
  }

  async function createTree() {
    if (!newTreeName.trim()) {
      setMessage("Please enter a tree name");
      return;
    }

    try {
      const newTree = await trees.create(newTreeName);
      setTreesList([...treesList, newTree]);
      setNewTreeName("");
      setMessage(`Created tree: ${newTree.name}`);
    } catch (error) {
      setMessage(`Error creating tree: ${error}`);
    }
  }

  async function deleteTree(name: string) {
    // TODO: Replace with proper Tauri dialog API
    // For now, skip confirmation - direct deletion
    
    try {
      await trees.delete(name);
      setTreesList(treesList.filter(tree => tree.name !== name));
      setMessage(`Deleted tree: ${name}`);
    } catch (error) {
      setMessage(`Error deleting tree: ${error}`);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Vata Genealogy</h1>
      <p>Select a family tree to work with, or create a new one.</p>
      
      {message && (
        <div style={{ padding: "10px", backgroundColor: "#f0f0f0", marginBottom: "20px" }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h2>Create New Tree</h2>
        <form onSubmit={(e) => { e.preventDefault(); createTree(); }}>
          <input
            type="text"
            value={newTreeName}
            onChange={(e) => setNewTreeName(e.target.value)}
            placeholder="Enter tree name..."
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <button type="submit">Create Tree</button>
        </form>
      </div>

      <div>
        <h2>Available Trees ({treesList.length})</h2>
        {treesList.length === 0 ? (
          <p>No trees found. Create one above!</p>
        ) : (
          <div>
            {treesList.map((tree) => (
              <div key={tree.name} style={{ 
                padding: "15px", 
                border: "1px solid #ccc", 
                marginBottom: "10px",
                backgroundColor: "white"
              }}>
                <h3>{tree.name}</h3>
                <p>Path: {tree.path}</p>
                <p>Created: {new Date(parseInt(tree.created_at) * 1000).toLocaleDateString()}</p>
                
                <Link 
                  to="/$treeId" 
                  params={{ treeId: tree.name }}
                  style={{ 
                    display: "inline-block",
                    padding: "8px 16px", 
                    backgroundColor: "#4CAF50", 
                    color: "white", 
                    textDecoration: "none",
                    marginRight: "10px"
                  }}
                >
                  Open Tree
                </Link>
                
                <button 
                  onClick={() => deleteTree(tree.name)}
                  style={{ 
                    padding: "8px 16px",
                    backgroundColor: "#f44336", 
                    color: "white", 
                    border: "none"
                  }}
                >
                  Delete
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