import { Button, Select } from "@mantine/core";

import { IndividualGender, IndividualSort } from "@/api/individuals/types";
import { Group } from "@mantine/core";
import { SearchInput } from "../SearchInput";

interface ToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  gender: IndividualGender;
  setGender: (value: IndividualGender) => void;
  sort: IndividualSort;
  setSort: (value: IndividualSort) => void;
}

export function Toolbar({
  search,
  setSearch,
  gender,
  setGender,
  sort,
  setSort,
}: ToolbarProps) {
  return (
    <Group>
      <Button radius="xl">Add individual</Button>

      <SearchInput value={search} onChange={setSearch} />

      <Select
        checkIconPosition="right"
        data={[
          { label: "All gender", value: "all" },
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
        ]}
        onChange={(value) => setGender(value as IndividualGender)}
        radius="xl"
        value={gender}
      />

      <Select
        checkIconPosition="right"
        data={[
          { label: "First name (A-Z)", value: "first_name_asc" },
          { label: "First name (Z-A)", value: "first_name_desc" },
          { label: "Last name (A-Z)", value: "last_name_asc" },
          { label: "Last name (Z-A)", value: "last_name_desc" },
        ]}
        ml="auto"
        onChange={(value) => setSort(value as IndividualSort)}
        radius="xl"
        value={sort}
        w="14rem"
      />
    </Group>
  );
}
