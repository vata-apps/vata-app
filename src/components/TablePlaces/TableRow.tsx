import { PlaceForTable } from "@/api/places/fetchPlacesForTable";
import { Table, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

export function TableRow({ place }: { place: PlaceForTable }) {
  const navigate = useNavigate();

  return (
    <Table.Tr
      key={place.id}
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigate({
          to: "/places/$placeId",
          params: { placeId: place.id },
        });
      }}
    >
      <Table.Td>
        <Text>{place.name}</Text>
      </Table.Td>

      <Table.Td>
        <Text>{place.place_types.name}</Text>
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
