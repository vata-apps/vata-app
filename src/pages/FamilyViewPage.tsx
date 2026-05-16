import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Heading } from '@radix-ui/themes';

interface FamilyViewPageProps {
  treeId: string;
  familyId: string;
}

export function FamilyViewPage({ treeId, familyId }: FamilyViewPageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('families');
  return (
    <Box p="5">
      <Button asChild variant="ghost" color="gray" size="1">
        <Link to="/tree/$treeId/families" params={{ treeId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <Heading mt="2">{t('heading', { familyId })}</Heading>
    </Box>
  );
}
