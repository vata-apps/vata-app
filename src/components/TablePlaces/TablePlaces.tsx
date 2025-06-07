import { fetchPlacesForTable } from "@/api/places/fetchPlacesForTable";
import { fetchPlaceTypes } from "@/api/places/fetchPlaceTypes";
import { useTree } from "@/lib/use-tree";
import { Loader, Stack, Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { TableRow } from "./TableRow";
import { Toolbar } from "./Toolbar";
import { PlaceSort } from "./types";

interface TablePlacesProps {
  hideToolbar?: boolean;
}

export function TablePlaces({ hideToolbar = false }: TablePlacesProps) {
  const { currentTreeId } = useTree();

  const [placeType, setPlaceType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<PlaceSort>("name_asc");

  const [debouncedSearch] = useDebounce(search, 300);

  // Fetch data from supabase
  const places = useQuery({
    queryKey: ["places", currentTreeId],
    queryFn: () => fetchPlacesForTable(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
    placeholderData: keepPreviousData,
  });

  const placeTypes = useQuery({
    queryKey: ["placeTypes", currentTreeId],
    queryFn: () => fetchPlaceTypes(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
  });

  // Filter and sort data
  const data = useMemo(() => {
    if (!places.data) return [];

    let result = [...places.data];

    if (placeType !== "all") {
      result = result.filter((place) => place.place_types.id === placeType);
    }

    if (debouncedSearch) {
      result = result.filter((place) => {
        const name = place.name.toLowerCase();
        const search = debouncedSearch.toLowerCase();
        return name.includes(search);
      });
    }

    if (sort === "name_asc") {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sort === "name_desc") {
      result = result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [places.data, debouncedSearch, sort, placeType]);

  if (places.isLoading) return <Loader size="xl" />;

  return (
    <Stack>
      {!hideToolbar && (
        <Toolbar
          placeTypes={placeTypes.data ?? []}
          placeType={placeType}
          setPlaceType={setPlaceType}
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
        />
      )}

      <Table
        highlightOnHover
        stickyHeader
        stickyHeaderOffset={60}
        verticalSpacing="md"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Latitude</Table.Th>
            <Table.Th>Longitude</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {data.map((place) => (
            <TableRow key={place.id} place={place} />
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
