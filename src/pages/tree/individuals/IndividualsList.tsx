import { Icon } from '$/components/icon';
import { Avatar } from '$/components/ui/avatar';
import { SortValue } from '$/components/ui/SortBy/SortBy';
import { IndividualsSortColumn } from '$/db/trees/individuals';
import { formatName } from '$/db/trees/names';
import { shellContainer } from '$/styles/shared/shellContainer.stylex';
import { colorPrimitives } from '$/styles/tokens/colorPrimitives.stylex';
import { create, props } from '@stylexjs/stylex';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import * as styles from './IndividualsList.css';
import { DEFAULT_QUERY, individualsQuery } from './IndividualsList.queries';
import { IndividualsListHeader } from './IndividualsListHeader';

const newStyle = create({
  filters: {
    overflowY: 'auto',
    width: '13.75rem',
    height: '100%',
    padding: '0.75rem',
  },

  list: {
    padding: '1rem 1.5rem',
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: colorPrimitives.sand50,
  },
});

export function IndividualsList() {
  const [sort, setSort] = useState<SortValue<IndividualsSortColumn>>({
    column: DEFAULT_QUERY.sortColumn,
    direction: DEFAULT_QUERY.sortDirection,
  });

  const query = useQuery(
    individualsQuery({
      filters: {
        nameQuery: '',
        sex: 'all',
        status: 'all',
      },
      sortColumn: sort.column,
      sortDirection: sort.direction,
    })
  );

  const rows = query.data?.items ?? [];

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div {...props(shellContainer.base, shellContainer.borderInlineEnd, newStyle.filters)}>
          <div>Filters</div>
        </div>

        <div {...props(newStyle.list)}>
          <IndividualsListHeader
            count={rows.length}
            sort={{
              column: sort.column,
              direction: sort.direction,
              onChange: setSort,
            }}
          />

          <div className={styles.rows}>
            {rows.map((row) => (
              <button className={styles.row} key={row.id}>
                <div className={styles.rowName}>
                  <Avatar.Root>
                    <Avatar.Fallback>
                      {row.primaryName?.givenNames?.[0]}
                      {row.primaryName?.surname?.[0]}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <span>{formatName(row.primaryName).full}</span>
                </div>
                <div className={styles.rowChevron}>
                  <Icon name="chevron-right" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>TODO: Add statistics</footer>
    </div>
  );
}
