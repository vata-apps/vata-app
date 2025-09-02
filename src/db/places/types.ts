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
