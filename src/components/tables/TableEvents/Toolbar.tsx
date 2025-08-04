import { Button, Select } from "@mantine/core";

import { SearchInput } from "@/components/SearchInput";
import { Group } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { EventSort, EventType } from "./types";

interface ToolbarProps {
  eventTypes: EventType[];
  eventType: EventType["id"];
  setEventType: (value: EventType["id"]) => void;
  search: string;
  setSearch: (value: string) => void;
  sort: EventSort;
  setSort: (value: EventSort) => void;
}

export function Toolbar({
  eventType,
  setEventType,
  eventTypes,
  search,
  setSearch,
  sort,
  setSort,
}: ToolbarProps) {
  const navigate = useNavigate();

  return (
    <Group>
      <Button radius="xl" onClick={() => navigate({ to: "/events/add" })}>
        Add event
      </Button>

      <SearchInput value={search} onChange={setSearch} />

      <Select
        checkIconPosition="right"
        data={[
          { label: "All types", value: "all" },
          ...eventTypes.map((eventType) => ({
            label: eventType.name,
            value: eventType.id,
          })),
        ]}
        onChange={(value) => setEventType(value as string)}
        radius="xl"
        value={eventType}
        allowDeselect={false}
      />

      <Select
        checkIconPosition="right"
        data={[
          { label: "Date (oldest first)", value: "date_asc" },
          { label: "Date (newest first)", value: "date_desc" },
        ]}
        ml="auto"
        onChange={(value) => setSort(value as EventSort)}
        radius="xl"
        value={sort}
        w="14rem"
        allowDeselect={false}
      />
    </Group>
  );
}
