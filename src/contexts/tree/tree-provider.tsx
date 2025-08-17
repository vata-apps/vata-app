import { fetchTrees } from "@/db";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ReactNode, useEffect, useState } from "react";
import { TreeContext } from "./tree-context";
import type { TreeContextValue } from "./types";

const STORAGE_KEY = "vata-selected-tree-id";

interface TreeProviderProps {
  readonly children: ReactNode;
}

export const TreeProvider = ({ children }: TreeProviderProps) => {
  const [currentTreeId, setCurrentTreeId] = useState<string | null>(null);
  const router = useRouter();

  const { data: trees = [], isLoading } = useQuery({
    queryKey: ["trees"],
    queryFn: fetchTrees,
  });

  // Initialize tree selection
  useEffect(() => {
    if (trees.length === 0 || currentTreeId) return;

    // Try to get from localStorage first
    const savedTreeId = localStorage.getItem(STORAGE_KEY);

    if (savedTreeId && trees.some((tree) => tree.id === savedTreeId)) {
      setCurrentTreeId(savedTreeId);
    } else {
      // Find default tree or use first available
      const defaultTree = trees.find((tree) => tree.is_default) || trees[0];
      if (defaultTree) {
        setCurrentTreeId(defaultTree.id);
        localStorage.setItem(STORAGE_KEY, defaultTree.id);
      }
    }
  }, [trees, currentTreeId]);

  const setCurrentTree = (treeId: string) => {
    setCurrentTreeId(treeId);
    localStorage.setItem(STORAGE_KEY, treeId);
    router.navigate({ to: "/" });
  };

  const currentTree = trees.find((tree) => tree.id === currentTreeId) || null;

  const value: TreeContextValue = {
    currentTreeId,
    currentTree,
    trees,
    isLoading,
    setCurrentTree,
  };

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
};
