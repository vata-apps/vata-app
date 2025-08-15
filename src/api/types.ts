export interface EventArgs extends TreeArgs {
  eventId: string;
}

export interface FamilyArgs extends TreeArgs {
  familyId: string;
}

export interface IndividualArgs extends TreeArgs {
  individualId: string;
}

export interface PlaceArgs extends TreeArgs {
  placeId: string;
}

export interface TreeArgs {
  treeId: string;
}
