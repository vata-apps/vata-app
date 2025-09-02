import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { useState } from "react";
import { PlacesTable } from "./PlacesTable";
import { PlacesToolbar } from "./PlacesToolbar";
import { PlacesFilters } from "./types";

const INITIAL_FILTER = {
  query: "",
  sort: "name_asc",
  type: "all",
} satisfies PlacesFilters;

export function PlacesPage() {
  const [filters, setFilters] = useState<PlacesFilters>(INITIAL_FILTER);

  return (
    <>
      <PageHeader title="Places" />

      <Stack gap="md">
        <PlacesToolbar filters={filters} setFilters={setFilters} />

        <PlacesTable filters={filters} />
      </Stack>
    </>
  );
}
