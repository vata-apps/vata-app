import type { TreeStatus, TreeStatusInfo } from "$/types/tree-status";

export function getStatusInfo(path: string, exists: boolean): TreeStatusInfo {
  if (!exists) {
    return {
      type: "orphaned",
      message: "warning",
      details: `The directory ${path} was not found on the filesystem.`,
    };
  }

  return {
    type: "healthy",
    message: "Healthy",
    details: "Tree is properly configured",
  };
}

export function getStatusColor(status: TreeStatus): string {
  switch (status) {
    case "healthy":
      return "green";
    case "orphaned":
      return "yellow";
    case "unregistered":
      return "red";
    case "error":
      return "red";
    default:
      return "gray";
  }
}
