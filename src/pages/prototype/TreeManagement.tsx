import { TreeManagerTest } from "./TreeManagerTest";

/**
 * Tree management page component
 * This is where users can create, update, delete and select trees
 */
export function TreeManagementPage() {
  return (
    <div>
      <h1>Tree Management</h1>

      <p>
        Manage your family trees below. You can create, update, delete and
        select trees.
      </p>

      <TreeManagerTest />
    </div>
  );
}
