import { useContext } from "react";
import { TreeContext } from "../contexts/tree/tree-context";
import type { TreeContextValue } from "../contexts/tree/types";

export const useTree = (): TreeContextValue => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
};
