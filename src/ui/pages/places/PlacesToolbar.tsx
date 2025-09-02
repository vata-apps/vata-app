import { SearchInput } from "@/components";
import { Button, Flex, Select } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { PlaceTypesFilter } from "./PlaceTypesFilter";
import { PlacesFilters, PlacesSort } from "./types";

interface PlacesToolbarProps {
  readonly filters: PlacesFilters;
  readonly setFilters: Dispatch<SetStateAction<PlacesFilters>>;
}

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "id_asc", label: "ID (1-9)" },
  { value: "id_desc", label: "ID (9-1)" },
] as const;

export function PlacesToolbar({ filters, setFilters }: PlacesToolbarProps) {
  return (
    <Flex gap="md" justify="space-between">
      <Flex gap="md" flex={1}>
        <Button radius="xl" variant="filled">
          Add Place
        </Button>

        <SearchInput
          value={filters.query}
          onChange={(value) => setFilters({ ...filters, query: value })}
        />

        <PlaceTypesFilter filter={filters} setFilter={setFilters} />
      </Flex>

      <Select
        value={filters.sort}
        data={SORT_OPTIONS}
        onChange={(value) =>
          setFilters({ ...filters, sort: value as PlacesSort })
        }
        checkIconPosition="right"
        radius="xl"
        w={200}
      />
    </Flex>
  );
}
