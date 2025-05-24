import { AddFamilyMember } from "@/components/individual/AddFamilyMember";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { FamilyWithRelations } from "@/types/family";
import { Button, Group, Table } from "@mantine/core";
import { Link } from "@tanstack/react-router";

/**
 * Displays a table of families where the individual is a spouse
 */
export function FamiliesAsSpouseTable({
  families,
  individualId,
}: {
  families: FamilyWithRelations[];
  individualId: string;
}) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Spouse</Table.Th>
          <Table.Th>Children</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {families.map((family) => {
          const spouse =
            family.husband?.id === individualId ? family.wife : family.husband;

          return (
            <Table.Tr key={family.id}>
              <Table.Td>
                {spouse ? (
                  <FamilyMember individual={spouse} />
                ) : (
                  <AddFamilyMember type="father" />
                )}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {family.children.map((child) => (
                    <FamilyMember
                      key={child.individual.id}
                      individual={child.individual}
                    />
                  ))}
                  {family.children.length === 0 && (
                    <AddFamilyMember type="sibling" />
                  )}
                </Group>
              </Table.Td>
              <Table.Td ta="right">
                <Button
                  component={Link}
                  to={`/families/${family.id}`}
                  size="xs"
                  variant="default"
                >
                  Edit
                </Button>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
