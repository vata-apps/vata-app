import { fetchFamilies } from "./fetchFamilies";

export async function fetchFamily(treeId: string, familyId: string) {
  const families = await fetchFamilies(treeId, {
    familyIds: [familyId],
  });

  if (!families[0]) throw new Error("Family not found");
  if (families.length > 1) throw new Error("Multiple families found");

  return families[0];
}

export type Family = Awaited<ReturnType<typeof fetchFamily>>;
