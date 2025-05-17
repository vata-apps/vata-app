import { AddFamilyMember } from "@/components/individual/AddFamilyMember";
import {
  FamilyMember,
  IndividualWithNames,
} from "@/components/individual/FamilyMember";
import { Button, Group, Table } from "@mantine/core";
import { Link } from "@tanstack/react-router";

export type FamilyWithRelations = {
  id: string;
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
};

/**
 * Displays the table with family information
 */
export function FamilyTable({
  family,
  individualId,
}: {
  family: FamilyWithRelations | null | undefined;
  individualId: string;
}) {
  const siblings =
    family?.children?.filter((child) => child.individual.id !== individualId) ||
    [];

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Father</Table.Th>
          <Table.Th>Mother</Table.Th>
          <Table.Th>Siblings</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>
            {family?.husband ? (
              <FamilyMember individual={family.husband} />
            ) : (
              <AddFamilyMember type="father" />
            )}
          </Table.Td>
          <Table.Td>
            {family?.wife ? (
              <FamilyMember individual={family.wife} />
            ) : (
              <AddFamilyMember type="mother" />
            )}
          </Table.Td>
          <Table.Td>
            <Group gap="xs">
              {siblings.map((child) => (
                <FamilyMember
                  key={child.individual.id}
                  individual={child.individual}
                />
              ))}
              {siblings.length === 0 && <AddFamilyMember type="sibling" />}
            </Group>
          </Table.Td>
          <Table.Td ta="right">
            {family && (
              <Button
                component={Link}
                to={`/families/${family.id}`}
                size="xs"
                variant="default"
              >
                Edit
              </Button>
            )}
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
