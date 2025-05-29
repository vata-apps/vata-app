export type IndividualFilters = {
  event?: { eventId: string; role: "subject" | "participant" };
  family?: { familyId: string; role: "parent" | "children" };
};

export type Individual = {
  id: string;
  gender: string | null;
  names: {
    first_name: string;
    last_name: string;
    is_primary: boolean;
  }[];
  individual_events: {
    id: string;
    date: string | null;
    type_id: string;
    place_id: string | null;
    places: {
      id: string;
      name: string;
    } | null;
    individual_event_types: {
      id: string;
      name: string;
    } | null;
  }[];
};
