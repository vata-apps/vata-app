export type PlacesSort = "id_asc" | "id_desc" | "name_asc" | "name_desc";

export interface PlacesFilters {
  readonly query: string;
  readonly sort: PlacesSort;
  readonly type: "all" | string;
}
