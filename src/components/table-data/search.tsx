import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useTableData } from "./use-table-data";

interface SearchProps {
  placeholder?: string;
}

export function Search({ placeholder = "Search..." }: SearchProps) {
  const { table } = useTableData();
  const value = table.getState().globalFilter ?? "";

  return (
    <div className="relative max-w-sm mb-4">
      <Input
        type="text"
        value={value}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => table.setGlobalFilter("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
