import { SortValue } from '$/components/ui/SortBy/SortBy';
import { IndividualsSortColumn } from '$/db/trees/individuals';
import { shellContainer } from '$/styles/shared/shellContainer.stylex';
import { colorPrimitives } from '$/styles/tokens/colorPrimitives.stylex';
import { create, props } from '@stylexjs/stylex';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import * as styles from './IndividualsList.css';
import { DEFAULT_QUERY, individualsQuery } from './IndividualsList.queries';
import { IndividualsListHeader } from './IndividualsListHeader';
import { IndividualsListRow } from './IndividualsListRow';

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
    column: DEFAULT_QUERY.sort.column,
    direction: DEFAULT_QUERY.sort.direction,
  });

  const query = useQuery(
    individualsQuery({
      filters: {
        nameQuery: '',
        sex: 'all',
        status: 'all',
      },
      sort,
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
              <IndividualsListRow key={row.id} row={row} />
            ))}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>TODO: Add statistics</footer>
    </div>
  );
}
