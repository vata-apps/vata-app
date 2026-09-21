import { Icon } from '$/components/icon';
import { Avatar } from '$/components/ui/avatar';
import { formatName } from '$/db/trees/names';
import { useQuery } from '@tanstack/react-query';
import * as styles from './IndividualsList.css';
import { DEFAULT_QUERY, individualsQuery } from './IndividualsList.queries';

const query = DEFAULT_QUERY;

export function IndividualsList() {
  const { data } = useQuery(individualsQuery(query));

  const rows = data?.items ?? [];

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.filters}>
          <div>Filters</div>
        </div>

        <div className={styles.list}>
          <div className={styles.header}>
            <div className={styles.headerCount}>{data?.items.length} people</div>
            <div className={styles.headerSort}>
              <span>Trier par</span>
              {/* TODO: Create a real Select/Filters component */}
              {/* <Select.Root value={value} onValueChange={setValue}>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Icon>
                    <Icon name="chevron-down" size={16} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner>
                    <Select.Popup style={{ padding: '8px' }}>
                      <Select.List>
                        {[...Array(25)].map((_, index) => (
                          <Select.Item value={`Option ${index + 1}`}>
                            <Select.ItemText>Option {index + 1}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root> */}
            </div>
          </div>

          <div className={styles.rows}>
            {rows.map((row) => (
              <button className={styles.row} key={row.id}>
                <div className={styles.rowName}>
                  <Avatar.Root>
                    {/* TODO: Support image */}
                    <Avatar.Image />
                    <Avatar.Fallback>
                      {row.primaryName?.givenNames?.[0]}
                      {row.primaryName?.surname?.[0]}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <span>{formatName(row.primaryName).full}</span>
                </div>
                <div className={styles.rowMeta}>
                  <span>XXXX-XXXX</span>
                  <span>X children</span>
                  <span>X sources</span>
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
