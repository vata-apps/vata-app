import { SortBy, SortOption, SortProps } from '$/components/ui/SortBy/SortBy';
import { IndividualsSortColumn } from '$/db/trees/individuals';
import { colorPrimitives } from '$/styles/tokens/colorPrimitives.stylex';
import { create, props } from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';

interface IndividualsListHeaderProps {
  count: number;
  sort: SortProps<IndividualsSortColumn>;
}

export function IndividualsListHeader({ count, sort }: IndividualsListHeaderProps) {
  const { t } = useTranslation('common');

  const SORT_OPTIONS = [
    {
      label: t('sort.field.surnameAsc'),
      column: 'surname',
      direction: 'asc',
    },
    {
      label: t('sort.field.surnameDesc'),
      column: 'surname',
      direction: 'desc',
    },
    {
      label: t('sort.field.firstNameAsc'),
      column: 'firstName',
      direction: 'asc',
    },
    {
      label: t('sort.field.firstNameDesc'),
      column: 'firstName',
      direction: 'desc',
    },
  ] satisfies SortOption<IndividualsSortColumn>[];

  return (
    <div {...props(styles.header)}>
      <div {...props(styles.count)}>{count} people</div>
      <div {...props(styles.sort)}>
        <SortBy<IndividualsSortColumn> {...sort} options={SORT_OPTIONS} />
      </div>
    </div>
  );
}

const styles = create({
  header: { display: 'flex', alignItems: 'center' },
  count: { color: colorPrimitives.gray600, fontSize: '16px' },
  sort: { marginInlineStart: 'auto' },
});
