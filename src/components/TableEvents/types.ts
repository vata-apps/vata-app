export type EventSort = "date_asc" | "date_desc";

export type EventType = {
  id: string;
  name: string;
};

export type EventTableColumn =
  | "id"
  | "eventType"
  | "date"
  | "place"
  | "individuals";
