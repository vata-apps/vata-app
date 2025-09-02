import { ErrorState } from "@/components/ErrorState";
import { fetchPlaces } from "@/db/places/fetchPlaces";
import { Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { filterPlaces } from "./PlacesTable.utils";
import { PlacesTableLoading } from "./PlacesTableLoading";
import { PlacesTableRow } from "./PlacesTableRow";
import { PlacesFilters } from "./types";

interface PlacesTableProps {
  readonly filters: PlacesFilters;
}

export function PlacesTable({ filters }: PlacesTableProps) {
  const { treeId } = useParams({ from: "/$treeId/places" });

  const {
    data: places = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["places", treeId],
    queryFn: () => fetchPlaces(treeId),
    placeholderData: keepPreviousData,
  });

  if (error) return <ErrorState error={error} />;

  const filteredPlaces = filterPlaces({ places, filters });

  return (
    <Table verticalSpacing="sm" highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={100}>ID</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th w={300}>Type</Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {isLoading && !filteredPlaces.length && <PlacesTableLoading />}

        {filteredPlaces.map((place) => (
          <PlacesTableRow key={place.id} place={place} />
        ))}
      </Table.Tbody>
    </Table>
  );
}
