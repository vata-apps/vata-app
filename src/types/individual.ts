import { Enums, Tables } from "@/database.types";

/**
 * Base type for name information
 */
export type Name = Pick<
  Tables<"names">,
  "first_name" | "last_name" | "is_primary"
>;

/**
 * Individual with associated names (most common pattern)
 */
export type IndividualWithNames = {
  id: string;
  gender: Enums<"gender">;
  names: Name[];
};

/**
 * Individual with names that can be single or array (used in some components)
 */
export type IndividualWithNamesVariant = {
  id: string;
  gender: Enums<"gender">;
  names: Name | Name[];
};

/**
 * Extended individual with full family relationships
 */
export type IndividualWithRelations = {
  id: string;
  gender: Tables<"individuals">["gender"];
  names: Tables<"names">[];
  family_as_child: {
    family: {
      husband: IndividualWithNames | null;
      wife: IndividualWithNames | null;
      children: {
        individual: {
          id: string;
        };
      }[];
    } | null;
  }[];
  families_as_spouse: {
    children: {
      individual: {
        id: string;
      };
    }[];
  }[];
};
