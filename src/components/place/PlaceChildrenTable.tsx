import { RecursivePlaceWithType } from "@/api/fetchPlacesRecursively";
import { capitalize } from "@/utils/strings";
import { Badge, Button, Group, Table } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { CornerDownRightIcon } from "lucide-react";

type PlaceChildrenTableProps = {
  places: RecursivePlaceWithType[];
  placeName: string;
};

/**
 * Displays the table with places information
 */
export function PlaceChildrenTable({
  places,
  placeName,
}: PlaceChildrenTableProps) {
  if (places.length === 0) {
    return (
      <div className="text-center py-8">No places found within {placeName}</div>
    );
  }

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th ta="right">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {places.map((place) => (
          <Table.Tr key={place.id}>
            <Table.Td>
              <Group gap="xs" wrap="nowrap">
                {/* Add indentation based on the level */}
                {Array.from({ length: place.level }).map((_, index) => (
                  <span key={index} />
                ))}
                <CornerDownRightIcon size={16} />
                <Link
                  to="/places/$placeId"
                  params={{
                    placeId: place.id,
                  }}
                >
                  {place.name}
                </Link>
              </Group>
            </Table.Td>
            <Table.Td>
              <Badge variant="default">{capitalize(place.type.name)}</Badge>
            </Table.Td>
            <Table.Td ta="right">
              <Button
                component={Link}
                to={`/places/${place.id}`}
                size="xs"
                variant="default"
              >
                View
              </Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
