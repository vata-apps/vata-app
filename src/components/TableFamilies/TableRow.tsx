import { FamilyForTable } from "@/api/families/fetchFamiliesForTable";
import displayName from "@/utils/displayName";
import { Code, Group, Table, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { GenderIcon } from "../GenderIcon";

interface TableRowProps {
  family: FamilyForTable;
  sortedBy: "first_name" | "last_name";
}

export function TableRow({ family, sortedBy }: TableRowProps) {
  const navigate = useNavigate();

  return (
    <Table.Tr
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigate({
          to: "/families/$familyId",
          params: { familyId: family.id },
        });
      }}
    >
      <Table.Td valign="top">
        <Code>F-{family.gedcomId.toString().padStart(4, "0")}</Code>
      </Table.Td>
      <Table.Td valign="top">
        {family.husband && (
          <Group>
            <GenderIcon gender={family.husband.gender} size={16} />
            <Text>
              {displayName(family.husband.names, {
                part: sortedBy === "first_name" ? "full" : "fullInverted",
              })}
            </Text>
          </Group>
        )}
      </Table.Td>
      <Table.Td valign="top">
        {family.wife && (
          <Group>
            <GenderIcon gender={family.wife.gender} size={16} />
            <Text>
              {displayName(family.wife.names, {
                part: sortedBy === "first_name" ? "full" : "fullInverted",
              })}
            </Text>
          </Group>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap="lg">
          {family.children.map((child) => (
            <Group key={child.id} gap="xs">
              <GenderIcon gender={child.gender} size={16} />
              <Text>
                {displayName(child.names, {
                  part: sortedBy === "first_name" ? "full" : "fullInverted",
                })}
              </Text>
            </Group>
          ))}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
