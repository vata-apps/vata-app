import { ActionIcon, TextInput } from "@mantine/core";
import { SearchIcon, X } from "lucide-react";
import { useRef } from "react";
import { useTableData } from "./useTableData";

interface SearchProps {
  placeholder?: string;
}

export function Search({ placeholder }: SearchProps) {
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
      size="sm"
      w="100%"
      maw={{ base: "100%", xs: "320px" }}
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
