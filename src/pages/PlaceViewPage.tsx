import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Heading } from '@radix-ui/themes';

interface PlaceViewPageProps {
  treeId: string;
  placeId: string;
}

export function PlaceViewPage({ treeId, placeId }: PlaceViewPageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('places');
  return (
    <Box p="5">
      <Button asChild variant="ghost" color="gray" size="1">
        <Link to="/tree/$treeId/places" params={{ treeId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <Heading mt="2">{t('heading', { placeId })}</Heading>
    </Box>
  );
}
