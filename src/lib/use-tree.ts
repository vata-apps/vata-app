import type { TreeContextValue } from "@/types/tree";
import { useContext } from "react";
import { TreeContext } from "./tree-context";

export const useTree = (): TreeContextValue => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
};
