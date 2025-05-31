import { AddFamilyMember } from "@/components/individual/AddFamilyMember";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { FamilyWithRelations } from "@/types/family";
import { Group, Table } from "@mantine/core";

/**
 * Displays the table with family information
 */
export function FamilyAsChildTable({
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
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td w="20%" valign="top">
            {family?.husband ? (
              <FamilyMember individual={family.husband} />
            ) : (
              <AddFamilyMember type="father" />
            )}
          </Table.Td>
          <Table.Td w="20%" valign="top">
            {family?.wife ? (
              <FamilyMember individual={family.wife} />
            ) : (
              <AddFamilyMember type="mother" />
            )}
          </Table.Td>
          <Table.Td valign="top">
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
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
