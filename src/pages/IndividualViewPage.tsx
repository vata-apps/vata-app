import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Heading } from '@radix-ui/themes';

interface IndividualViewPageProps {
  treeId: string;
  individualId: string;
}

export function IndividualViewPage({ treeId, individualId }: IndividualViewPageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('individuals');
  return (
    <Box p="5">
      <Button asChild variant="ghost" color="gray" size="1">
        <Link to="/tree/$treeId/individuals" params={{ treeId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <Heading mt="2">{t('heading', { individualId })}</Heading>
    </Box>
  );
}
