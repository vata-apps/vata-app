type FamilyViewPageProps = {
  treeId: string;
  familyId: string;
};

export function FamilyViewPage({ treeId: _treeId, familyId }: FamilyViewPageProps) {
  return <h1>Family {familyId}</h1>;
}
