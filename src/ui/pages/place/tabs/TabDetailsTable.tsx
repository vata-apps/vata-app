import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { fetchPlaceById } from "@/db/places/fetchPlaceById";
import { fetchPlacesByParentId } from "@/db/places/fetchPlacesByParentId";
import { ActionIcon, Table } from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

export function TabDetailsTable() {
  const { treeId, placeId } = useParams({ from: "/$treeId/places/$placeId" });

  const {
    data: place,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["place", treeId, placeId],
    queryFn: () => fetchPlaceById(treeId, placeId),
    placeholderData: keepPreviousData,
  });

  const {
    data: placeChildren = [],
    error: errorChildren,
    isLoading: isLoadingChildren,
  } = useQuery({
    queryKey: ["placeChildren", treeId, placeId],
    queryFn: () => fetchPlacesByParentId(treeId, placeId),
    placeholderData: keepPreviousData,
  });

  if (isLoading || isLoadingChildren)
    return <LoadingState message="Loading place..." />;

  if (errorChildren) return <ErrorState error={errorChildren} />;
  if (error) return <ErrorState error={error} />;

  if (!place) return <ErrorState error={new Error("Place not found")} />;

  return (
    <Table variant="vertical">
      <Table.Tbody>
        <Table.Tr>
          <Table.Th w={200}>ID</Table.Th>
          <Table.Td>{place.gedcomId}</Table.Td>
          <Table.Td ta="right">
            <ActionIcon variant="default">
              <IconCopy size={16} />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Th w={200}>Name</Table.Th>
          <Table.Td>{place.name}</Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Th w={200}>Type</Table.Th>
          <Table.Td>{place.type?.name ?? "Unknown"}</Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Th w={200}>Latitude / Longitude</Table.Th>
          <Table.Td>
            {place.latitude}, {place.longitude}
          </Table.Td>

          <Table.Td ta="right">
            <ActionIcon variant="default">
              <IconCopy size={16} />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Th w={200}>Included in</Table.Th>
          <Table.Td>{place.parent?.name}</Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Th w={200} style={{ verticalAlign: "top" }}>
            Includes
          </Table.Th>
          <Table.Td>
            {placeChildren.map((child) => (
              <div key={child.id}>{child.name}</div>
            ))}
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
