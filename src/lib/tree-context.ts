import type { TreeContextValue } from "@/types/tree";
import { createContext } from "react";

export const TreeContext = createContext<TreeContextValue | null>(null);
