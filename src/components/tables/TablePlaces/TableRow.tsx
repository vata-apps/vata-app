import { Places } from "@/api/places/fetchPlaces";
import { Code, Table, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

interface TableRowProps {
  readonly place: Places[number];
}

export function TableRow({ place }: TableRowProps) {
  const navigate = useNavigate();

  return (
    <Table.Tr
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigate({
          to: "/places/$placeId",
          params: { placeId: place.id },
        });
      }}
    >
      <Table.Td w="100px">
        <Code>{place.gedcomId}</Code>
      </Table.Td>

      <Table.Td>
        <Text>{place.name}</Text>
      </Table.Td>

      <Table.Td>
        <Text>{place.placeType.name}</Text>
      </Table.Td>

      <Table.Td>
        <Text>{place.latitude}</Text>
      </Table.Td>

      <Table.Td>
        <Text>{place.longitude}</Text>
      </Table.Td>
    </Table.Tr>
  );
}
