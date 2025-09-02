import { TablePlaces } from "@/db/places/types";
import { PlacesFilters } from "./types";

interface FilterPlacesProps {
  readonly places: TablePlaces;
  readonly filters: PlacesFilters;
}

export function filterPlaces(props: FilterPlacesProps): TablePlaces {
  const { query, type, sort } = props.filters;

  return props.places
    .filter((place) => {
      return place.name.toLowerCase().includes(query.toLowerCase());
    })
    .filter((place) => {
      return type === "all" ? true : place.type.id === type;
    })
    .sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "name_desc") return b.name.localeCompare(a.name);
      if (sort === "id_asc") return a.id.localeCompare(b.id);
      if (sort === "id_desc") return b.id.localeCompare(a.id);
      return 0;
    });
}
