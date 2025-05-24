import { Tables } from "@/database.types";

/**
 * Place with type information - matches current API usage
 */
export type PlaceWithType = Tables<"places"> & {
  place_type: Pick<Tables<"place_types">, "name">;
  parent?: Pick<Tables<"places">, "name"> | null;
};
