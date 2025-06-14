import { EventForTable } from "@/api/events/fetchEventsForTable";
import { GenderIcon } from "@/components/GenderIcon";
import displayName from "@/utils/displayName";
import { Code, Group, Table, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { EventTableColumn } from "./types";

interface TableRowProps {
  event: EventForTable;
  hideColumns: EventTableColumn[];
}

export function TableRow({ event, hideColumns }: TableRowProps) {
  const navigate = useNavigate();

  return (
    <Table.Tr
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigate({
          to: "/events/$eventId",
          params: { eventId: event.id },
        });
      }}
    >
      {!hideColumns.includes("id") && (
        <Table.Td>
          <Code>E-xxxxx</Code>
        </Table.Td>
      )}
      {!hideColumns.includes("eventType") && (
        <Table.Td>
          <Text>{event.eventType.name}</Text>
        </Table.Td>
      )}
      {!hideColumns.includes("date") && (
        <Table.Td>
          <Text>{event.date}</Text>
        </Table.Td>
      )}
      {!hideColumns.includes("place") && (
        <Table.Td>
          <Text truncate>{event.place?.name}</Text>
        </Table.Td>
      )}
      {!hideColumns.includes("individuals") && (
        <Table.Td>
          <Group gap="lg">
            {event.individuals?.map((individual) => (
              <Group key={individual.id} gap="xs">
                <GenderIcon gender={individual.gender} size={16} />
                <Text>{displayName(individual.names)}</Text>
              </Group>
            ))}
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  );
}
