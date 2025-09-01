import { fetchEvents } from "@/api/events/fetchEvents";
import { fetchEventTypes } from "@/api/events/fetchEventTypes";
import { useTree } from "@/hooks/use-tree";
import { Stack, Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { TableRow } from "./TableRow";
import { Toolbar } from "./Toolbar";
import { EventSort, EventType } from "./types";

interface Props {
  placeId?: string;
}

export function TableEvents({ placeId }: Props) {
  const { currentTreeId } = useTree();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<EventSort>("date_asc");
  const [eventType, setEventType] = useState<EventType["id"]>("all");
  const [debouncedSearch] = useDebounce(search, 300);

  const queryEvents = useQuery({
    queryKey: ["events", currentTreeId, placeId],
    queryFn: () =>
      fetchEvents(currentTreeId ?? "", {
        ...(placeId && { placeIds: [placeId] }),
      }),
    enabled: Boolean(currentTreeId),
    placeholderData: keepPreviousData,
  });

  const queryEventTypes = useQuery({
    queryKey: ["eventTypes", currentTreeId],
    queryFn: () => fetchEventTypes(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
    placeholderData: keepPreviousData,
  });

  const data = useMemo(() => {
    if (!queryEvents.data) return [];

    let result = [...queryEvents.data];

    if (eventType !== "all") {
      result = result.filter((event) => event.type.id === eventType);
    }

    if (debouncedSearch) {
      result = result.filter((event) =>
        event.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
      );
    }

    if (sort === "date_asc") {
      result = result.sort((a, b) => a.date?.localeCompare(b.date ?? "") ?? 0);
    }

    if (sort === "date_desc") {
      result = result.sort((a, b) => b.date?.localeCompare(a.date ?? "") ?? 0);
    }

    return result;
  }, [queryEvents.data, debouncedSearch, sort, eventType]);

  return (
    <Stack>
      <Toolbar
        eventTypes={queryEventTypes.data ?? []}
        eventType={eventType}
        setEventType={setEventType}
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
      />

      <Table
        highlightOnHover
        stickyHeader
        stickyHeaderOffset={60}
        verticalSpacing="md"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th w="100px">ID</Table.Th>
            <Table.Th>Event</Table.Th>
            <Table.Th w="200px">Date</Table.Th>
            <Table.Th w="450px">Place</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {data.map((event) => (
            <TableRow key={event.id} event={event} />
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
