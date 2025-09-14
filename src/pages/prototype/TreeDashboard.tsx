import { useState, useEffect } from "react";
import { Link, Outlet, useParams, useNavigate } from "@tanstack/react-router";
import { system } from "$db";
import type { Tree } from "$db";

/**
 * Tree dashboard component
 * All tree-specific pages will be sub-routes of this route
 */
export function TreeDashboard() {
  const { treeId } = useParams({ from: "/tree/$treeId" });
  const navigate = useNavigate();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Load and validate tree from database
     */
    async function loadTree() {
      try {
        setLoading(true);
        setError(null);

        // Initialize system database if needed
        await system.initializeSystemDatabase();

        // Try to get the tree
        const treeData = await system.trees.getTreeById(treeId);

        if (!treeData) {
          setError(`Tree with ID "${treeId}" not found`);
          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate({ to: "/" });
          }, 3000);
        } else {
          setTree(treeData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tree");
      } finally {
        setLoading(false);
      }
    }

    loadTree();
  }, [treeId, navigate]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading tree...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
          ← Back to Tree Management
        </Link>
      </div>
    );
  }

  if (!tree) {
    return null;
  }

  return (
    <div>
      <div>
        <h1>Tree Dashboard</h1>
        <Link to="/">← Back to Tree Management</Link>
      </div>

      <div>
        <h2>{tree.name}</h2>
        <p>ID: {tree.id}</p>
        {tree.description && <p>Description: {tree.description}</p>}
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Created: {tree.created_at.toLocaleString()}
        </p>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          File: {tree.file_path}
        </p>
      </div>

      {/* Future sub-routes will be rendered here */}
      <Outlet />
    </div>
  );
}
