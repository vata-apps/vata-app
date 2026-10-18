import { Icon } from '$/components/icon';
import { Avatar } from '$/components/ui/avatar';
import { formatName } from '$/db/trees/names';
import { extractYear } from '$/db/trees/person-overview';
import { formatLifeYears } from '$/lib/personSummary';
import { colorPrimitives } from '$/styles/tokens/colorPrimitives.stylex';
import { IndividualWithDetails } from '$/types/database';
import { create, props } from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';

interface IndividialsListRowProps {
  row: IndividualWithDetails;
}

export function IndividualsListRow({ row }: IndividialsListRowProps) {
  const { t } = useTranslation('individuals');

  const bornYear = extractYear(row.birthEvent);
  const deathYear = extractYear(row.deathEvent);

  return (
    <button {...props(styles.root)} key={row.id}>
      <div {...props(styles.name)}>
        <Avatar.Root>
          <Avatar.Fallback>
            {row.primaryName?.givenNames?.[0]}
            {row.primaryName?.surname?.[0]}
          </Avatar.Fallback>
        </Avatar.Root>
        <span>{formatName(row.primaryName).full}</span>
      </div>

      <div {...props(styles.data)}>{formatLifeYears({ bornYear, deathYear }, t)}</div>
      <div {...props(styles.data)}>{t('list.children', { count: row.childrenCount })}</div>
      <div {...props(styles.data)}>TODO</div>

      <div {...props(styles.chevron)}>
        <Icon name="chevron-right" />
      </div>
    </button>
  );
}

const styles = create({
  root: {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colorPrimitives.gray200,
    borderRadius: '10px',
    width: '100%',
    padding: '12px',
    gap: '12px',
  },

  name: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    color: colorPrimitives.olive800,
    width: '50%',
  },

  data: {
    width: '15%',
    fontSize: '14px',
    color: colorPrimitives.gray600,
  },

  chevron: {
    color: colorPrimitives.gray300,
    display: 'flex',
    marginInlineStart: 'auto',
  },
});
