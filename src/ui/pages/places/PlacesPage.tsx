import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PlacesToolbar } from "./PlacesToolbar";
import { PlacesFilters } from "./types";

const INITIAL_FILTER = {
  query: "",
  sort: "name_asc",
  type: "all",
} satisfies PlacesFilters;

export function PlacesPage() {
  const { treeId } = useParams({ from: "/$treeId/places" });

  const [filter, setFilter] = useState<PlacesFilters>(INITIAL_FILTER);

  return (
    <>
      <PageHeader title="Places" />

      <Stack gap="md">
        <PlacesToolbar filter={filter} setFilter={setFilter} />

        <p>Tree ID: {treeId}</p>
        <Link to="/$treeId/places/$placeId" params={{ treeId, placeId: "1" }}>
          Place 1
        </Link>
      </Stack>
    </>
  );
}
