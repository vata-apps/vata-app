import { INDIVIDUALS_PAGE_SIZE, IndividualsPageQuery } from '$/hooks/useIndividuals';
import { queryKeys } from '$/lib/query-keys';
import { IndividualManager } from '$/managers/IndividualManager';

export const DEFAULT_QUERY = {
  filters: {
    nameQuery: '',
    sex: 'all',
    status: 'all',
  },
  sort: {
    column: 'firstName',
    direction: 'asc',
  },
} satisfies IndividualsPageQuery;

export function individualsQuery(query: IndividualsPageQuery) {
  return {
    queryKey: queryKeys.individualsPage(query),
    queryFn: function fetchInviduals() {
      return IndividualManager.getPage({
        ...query,
        limit: INDIVIDUALS_PAGE_SIZE,
        offset: 0,
      });
    },
  };
}
