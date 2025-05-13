import { ActionIcon, TextInput } from "@mantine/core";
import { Search as SearchIcon, X } from "lucide-react";
import { useRef } from "react";
import { useTableData } from "./use-table-data";

interface SearchProps {
  placeholder?: string;
}

export function Search({ placeholder = "Search..." }: SearchProps) {
  const { table } = useTableData();
  const value = table.getState().globalFilter ?? "";
  const ref = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    table.setGlobalFilter("");
    ref.current?.focus();
  };

  return (
    <TextInput
      ref={ref}
      radius="xl"
      size="md"
      maw="300px"
      placeholder={placeholder}
      rightSectionWidth={42}
      leftSection={<SearchIcon size={18} />}
      rightSection={
        value && (
          <ActionIcon
            color="gray"
            onClick={handleClear}
            radius="xl"
            size={32}
            variant="subtle"
          >
            <X size={18} />
          </ActionIcon>
        )
      }
      value={value}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
    />
  );
}
