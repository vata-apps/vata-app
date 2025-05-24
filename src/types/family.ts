import { Tables } from "@/database.types";
import { IndividualWithNames } from "./individual";

/**
 * Family with relationships to individuals
 */
export type FamilyWithRelations = {
  id: string;
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
  type: Tables<"families">["type"];
};
