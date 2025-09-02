import { useParams } from "@tanstack/react-router";

export function SettingsPage() {
  const { treeId } = useParams({ from: "/$treeId/settings" });

  return (
    <div>
      <h1>Settings</h1>
      <p>Tree ID: {treeId}</p>
    </div>
  );
}
