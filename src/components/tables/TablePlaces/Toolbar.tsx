import { Button, Select } from "@mantine/core";

import { SearchInput } from "@/components/SearchInput";
import { Group } from "@mantine/core";
import { PlaceSort, PlaceType } from "./types";

interface ToolbarProps {
  placeTypes: PlaceType[];
  placeType: PlaceType["id"];
  setPlaceType: (value: PlaceType["id"]) => void;
  search: string;
  setSearch: (value: string) => void;
  sort: PlaceSort;
  setSort: (value: PlaceSort) => void;
}

export function Toolbar({
  placeType,
  setPlaceType,
  placeTypes,
  search,
  setSearch,
  sort,
  setSort,
}: ToolbarProps) {
  return (
    <Group>
      <Button radius="xl">Add place</Button>

      <SearchInput value={search} onChange={setSearch} />

      <Select
        checkIconPosition="right"
        data={[
          { label: "All types", value: "all" },
          ...placeTypes.map((placeType) => ({
            label: placeType.name,
            value: placeType.id,
          })),
        ]}
        onChange={(value) => setPlaceType(value as string)}
        radius="xl"
        value={placeType}
        allowDeselect={false}
      />

      <Select
        checkIconPosition="right"
        data={[
          { label: "ID (asc)", value: "id_asc" },
          { label: "ID (desc)", value: "id_desc" },
          { label: "Name (A-Z)", value: "name_asc" },
          { label: "Name (Z-A)", value: "name_desc" },
        ]}
        ml="auto"
        onChange={(value) => setSort(value as PlaceSort)}
        radius="xl"
        value={sort}
        w="14rem"
        allowDeselect={false}
      />
    </Group>
  );
}
