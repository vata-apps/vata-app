import { Group } from "@mantine/core";

import { IndividualForTable } from "@/api/individuals/fetchIndividualsForTable";
import { GenderIcon } from "@/components/GenderIcon";
import { capitalize } from "@/utils/strings";
import { Code, Table, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

export function TableRow({ individual }: { individual: IndividualForTable }) {
  const navigate = useNavigate();

  return (
    <Table.Tr
      key={individual.id}
      h="65px"
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigate({
          to: "/individuals/$individualId",
          params: { individualId: individual.id },
        });
      }}
    >
      <Table.Td valign="top" w="100px">
        <Code>I-{individual.gedcomId.toString().padStart(4, "0")}</Code>
      </Table.Td>

      <Table.Td valign="top">
        <Text>{individual.firstName}</Text>
      </Table.Td>

      <Table.Td valign="top">
        <Text>{individual.lastName}</Text>
      </Table.Td>

      <Table.Td w="120px" valign="top">
        <Group>
          <GenderIcon gender={individual.gender} size={16} />{" "}
          <Text>{capitalize(individual.gender)}</Text>
        </Group>
      </Table.Td>

      <Table.Td maw="120px" valign="top">
        <Text>{individual.birth?.date}</Text>
        <Text c="dimmed">{individual.birth?.place}</Text>
      </Table.Td>

      <Table.Td maw="120px" valign="top">
        <Text>{individual.death?.date}</Text>
        <Text c="dimmed" truncate>
          {individual.death?.place}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}
