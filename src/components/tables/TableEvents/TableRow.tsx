import { Event } from "@/api/events/fetchEvent";
import { getEventTitle } from "@/utils/events";
import { Code, Table, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";

interface TableRowProps {
  event: Event;
}

export function TableRow({ event }: TableRowProps) {
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
      <Table.Td valign="top">
        <Code>{event.gedcomId}</Code>
      </Table.Td>

      <Table.Td valign="top">
        <Text>{getEventTitle(event)}</Text>
      </Table.Td>

      <Table.Td valign="top">
        <Text>{event.date}</Text>
      </Table.Td>

      <Table.Td valign="top">
        <Text truncate>{event.place?.name}</Text>
      </Table.Td>
    </Table.Tr>
  );
}
