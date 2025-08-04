import { Button, Select } from "@mantine/core";

import { SearchInput } from "@/components/SearchInput";
import { Group } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { FamilySort } from "./types";

interface ToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  sort: FamilySort;
  setSort: (value: FamilySort) => void;
}

export function Toolbar({ search, setSearch, sort, setSort }: ToolbarProps) {
  return (
    <Group>
      <Button component={Link} to="/families/add" radius="xl">
        Add family
      </Button>

      <SearchInput value={search} onChange={setSearch} />

      <Select
        checkIconPosition="right"
        data={[
          {
            label: "Husband first name (A-Z)",
            value: "husband_first_name_asc",
          },
          {
            label: "Husband first name (Z-A)",
            value: "husband_first_name_desc",
          },
          {
            label: "Husband last name (A-Z)",
            value: "husband_last_name_asc",
          },
          {
            label: "Husband last name (Z-A)",
            value: "husband_last_name_desc",
          },
          {
            label: "Wife first name (A-Z)",
            value: "wife_first_name_asc",
          },
          { label: "Wife first name (Z-A)", value: "wife_first_name_desc" },
          { label: "Wife last name (A-Z)", value: "wife_last_name_asc" },
          { label: "Wife last name (Z-A)", value: "wife_last_name_desc" },
        ]}
        ml="auto"
        onChange={(value) => setSort(value as FamilySort)}
        radius="xl"
        value={sort}
        w="14rem"
        allowDeselect={false}
      />
    </Group>
  );
}
