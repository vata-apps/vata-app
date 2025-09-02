import { TablePlace } from "@/db/places/types";
import { Table } from "@mantine/core";
import { useNavigate, useParams } from "@tanstack/react-router";

interface PlacesTableRowProps {
  readonly place: TablePlace;
}

export function PlacesTableRow({ place }: PlacesTableRowProps) {
  const { treeId } = useParams({ from: "/$treeId/places" });
  const navigate = useNavigate({ from: "/$treeId/places" });

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.preventDefault();

    if (e.metaKey) {
      window.open(`/${treeId}/places/${place.id}`, "_blank");
      return;
    }

    navigate({
      to: `/$treeId/places/$placeId`,
      params: { treeId, placeId: place.id },
    });
  };

  return (
    <Table.Tr onClick={handleClick} style={{ cursor: "pointer" }}>
      <Table.Td>{place.gedcomId}</Table.Td>
      <Table.Td>{place.name}</Table.Td>
      <Table.Td>{place.type.name}</Table.Td>
    </Table.Tr>
  );
}
