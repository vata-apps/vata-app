import type { fetchTrees } from "@/api/fetchTrees";

type TreesResponse = Awaited<ReturnType<typeof fetchTrees>>;
type Tree = TreesResponse[number];

export interface TreeContextValue {
  readonly currentTreeId: string | null;
  readonly currentTree: Tree | null;
  readonly trees: readonly Tree[];
  readonly isLoading: boolean;
  setCurrentTree: (treeId: string) => void;
}
