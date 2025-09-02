export const SELECT_PLACE_TYPES = "id, name, key" as const;

export interface PlaceType {
  readonly id: string;
  readonly key: string | null;
  readonly name: string;
}
