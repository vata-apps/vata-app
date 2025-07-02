import { Families } from "@/api/families/fetchFamilies";
import { GenderIcon } from "@/components/GenderIcon";
import displayName from "@/utils/displayName";
import { Code, Group, Table, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

interface TableRowProps {
  family: Families[number];
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
        <Code>{family.gedcomId}</Code>
      </Table.Td>
      <Table.Td valign="top">
        {family.husband && (
          <Group>
            <GenderIcon gender={family.husband.gender} size={16} />
            <Text>
              {displayName(family.husband, {
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
              {displayName(family.wife, {
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
                {displayName(child, {
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
