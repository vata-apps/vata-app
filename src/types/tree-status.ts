export type TreeStatus = "healthy" | "orphaned" | "unregistered" | "error";

export interface TreeStatusInfo {
  type: TreeStatus;
  message: string;
  details?: string;
}

export interface TreeWithStatus {
  id: string;
  label: string;
  path: string;
  created_at?: string;
  description?: string;
  status: TreeStatusInfo;
}

export const HEALTHY_STATUSES: TreeStatus[] = ["healthy"];
