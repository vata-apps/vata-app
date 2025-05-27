import { Tables } from "@/database.types";

// Define a recursive type for the parent hierarchy
type ParentPlace = {
  id: string;
  name: string;
  parent: ParentPlace | null;
};

/**
 * Place with type information and simple parent - used for listings
 */
export type PlaceWithTypeSimple = Tables<"places"> & {
  place_type: Pick<Tables<"place_types">, "name">;
  parent?: Pick<Tables<"places">, "name"> | null;
};

/**
 * Place with type information and recursive parent - used for detailed views
 */
export type PlaceWithType = Tables<"places"> & {
  place_type: Pick<Tables<"place_types">, "name">;
  parent?: ParentPlace | null;
};
