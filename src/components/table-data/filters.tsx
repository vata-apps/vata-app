import { ActionIcon, Button, Group, TextInput } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { PlusIcon, Search as SearchIcon, X } from "lucide-react";
import { useRef } from "react";
import { useTableData } from "./use-table-data";

interface FiltersProps {
  createPagePath: string;
  placeholder?: string;
}

export function Filters({
  createPagePath,
  placeholder = "Search...",
}: FiltersProps) {
  const { table } = useTableData();
  const value = table.getState().globalFilter ?? "";
  const ref = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    table.setGlobalFilter("");
    ref.current?.focus();
  };

  return (
    <Group gap="md">
      <Button
        w={{ base: "100%", xs: "auto" }}
        component={Link}
        leftSection={<PlusIcon width={16} />}
        size="sm"
        to={createPagePath}
        variant="primary"
        radius="xl"
      >
        Add
      </Button>

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
    </Group>
  );
}
