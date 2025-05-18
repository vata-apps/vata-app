import { Tables } from "@/database.types";

export type IndividualWithNames = {
  id: string;
  gender: Tables<"individuals">["gender"];
  names: Tables<"names">[];
};

export type FamilyWithRelations = {
  id: Tables<"families">["id"];
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
  type: Tables<"families">["type"];
};
