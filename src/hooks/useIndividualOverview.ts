import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { IndividualManager } from '$managers/IndividualManager';
import { FamilyManager } from '$managers/FamilyManager';
import type { FamilyWithMembers, IndividualWithDetails } from '$types/database';

export interface IndividualOverviewData {
  individual: IndividualWithDetails;
  parentFamilies: FamilyWithMembers[];
  spouseFamilies: FamilyWithMembers[];
}

async function loadIndividualOverview(id: string): Promise<IndividualOverviewData | null> {
  const individual = await IndividualManager.getById(id);
  if (!individual) return null;

  const [parentFamilies, spouseFamilies] = await Promise.all([
    FamilyManager.getParentFamiliesWithMembers(id),
    FamilyManager.getSpouseFamiliesWithMembers(id),
  ]);

  return { individual, parentFamilies, spouseFamilies };
}

export function useIndividualOverview(id: string) {
  return useQuery({
    queryKey: queryKeys.individualOverview(id),
    queryFn: () => loadIndividualOverview(id),
    enabled: !!id,
  });
}
