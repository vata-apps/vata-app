import { fetchEventsForTable } from "@/api/events/fetchEventsForTable";
import { fetchEventTypes } from "@/api/events/fetchEventTypes";
import { useTree } from "@/lib/use-tree";
import { Stack, Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { TableRow } from "./TableRow";
import { Toolbar } from "./Toolbar";
import { EventSort, EventTableColumn, EventType } from "./types";

interface TableEventsProps {
  individualIds?: string[];
  hideColumns?: EventTableColumn[];
  hideToolbar?: boolean;
  placeIds?: string[];
}

export function TableEvents({
  individualIds,
  hideColumns = [],
  hideToolbar = false,
  placeIds,
}: TableEventsProps) {
  const { currentTreeId } = useTree();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<EventSort>("date_asc");
  const [eventType, setEventType] = useState<EventType["id"]>("all");
  const [debouncedSearch] = useDebounce(search, 300);

  const queryEvents = useQuery({
    queryKey: ["events", currentTreeId, placeIds],
    queryFn: () =>
      fetchEventsForTable(currentTreeId ?? "", {
        placeIds,
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

    if (individualIds && individualIds.length > 0) {
      result = result.filter((event) =>
        event.individuals.some((individual) =>
          individualIds.includes(individual.id),
        ),
      );
    }

    if (eventType !== "all") {
      result = result.filter((event) => event.eventType.id === eventType);
    }

    if (debouncedSearch) {
      result = result.filter((event) =>
        event.eventType.name
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()),
      );
    }

    if (sort === "date_asc") {
      result = result.sort((a, b) => a.date?.localeCompare(b.date ?? "") ?? 0);
    }

    if (sort === "date_desc") {
      result = result.sort((a, b) => b.date?.localeCompare(a.date ?? "") ?? 0);
    }

    return result;
  }, [queryEvents.data, debouncedSearch, sort, eventType, individualIds]);

  return (
    <Stack>
      {!hideToolbar && (
        <Toolbar
          eventTypes={queryEventTypes.data ?? []}
          eventType={eventType}
          setEventType={setEventType}
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
        />
      )}

      <Table
        highlightOnHover
        stickyHeader
        stickyHeaderOffset={60}
        verticalSpacing="md"
      >
        <Table.Thead>
          <Table.Tr>
            {!hideColumns.includes("id") && <Table.Th w="100px">ID</Table.Th>}
            {!hideColumns.includes("eventType") && (
              <Table.Th w="150px">Type</Table.Th>
            )}
            {!hideColumns.includes("date") && (
              <Table.Th w="150px">Date</Table.Th>
            )}
            {!hideColumns.includes("place") && (
              <Table.Th w="350px">Place</Table.Th>
            )}
            <Table.Th>Subjects</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {data.map((event) => (
            <TableRow key={event.id} event={event} hideColumns={hideColumns} />
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
