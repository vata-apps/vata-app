export interface PlaceDetails {
  readonly id: string;
  readonly gedcomId: string;
  readonly name: string;
  readonly type: {
    readonly id: string;
    readonly name: string;
    readonly key: string | null;
  } | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly parent: {
    readonly id: string;
    readonly name: string;
  } | null;
}

export interface TablePlace {
  readonly id: string;
  readonly gedcomId: string;
  readonly name: string;
  readonly type: {
    readonly id: string;
    readonly name: string;
    readonly key: string | null;
  };
}

export type TablePlaces = TablePlace[];
