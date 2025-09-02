import { fetchPlaceTypes } from "@/db/placeTypes/fetchPlaceTypes";
import { Select } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Dispatch, SetStateAction } from "react";
import { PlacesFilters } from "./types";

const ALL_TYPES_OPTION = { value: "all", label: "All types" } as const;

interface PlaceTypesFilterProps {
  readonly filter: PlacesFilters;
  readonly setFilter: Dispatch<SetStateAction<PlacesFilters>>;
}

export function PlaceTypesFilter({ filter, setFilter }: PlaceTypesFilterProps) {
  const { treeId } = useParams({ from: "/$treeId/places" });

  const {
    data: placeTypes = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["placeTypes", treeId],
    queryFn: () => fetchPlaceTypes(treeId),
    placeholderData: keepPreviousData,
  });

  const placeTypeOptions = placeTypes.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const data = (() => {
    if (isLoading) return [{ value: "loading", label: "Loading types..." }];
    if (error) return [{ value: "error", label: "Error loading types!" }];

    return [ALL_TYPES_OPTION, ...placeTypeOptions];
  })();

  const value = (() => {
    if (isLoading) return "loading";
    if (error) return "error";
    return filter.type;
  })();

  const handleChange = (value: string | null) => {
    setFilter({ ...filter, type: value ?? "all" });
  };

  return (
    <Select
      value={value}
      data={data}
      onChange={handleChange}
      disabled={isLoading || Boolean(error)}
      checkIconPosition="right"
      radius="xl"
      w={200}
    />
  );
}
