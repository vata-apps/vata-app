import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Heading } from '@radix-ui/themes';

interface EventsPageProps {
  treeId: string;
}

export function EventsPage({ treeId }: EventsPageProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <Box p="5">
      <Button asChild variant="ghost" color="gray" size="1">
        <Link to="/tree/$treeId" params={{ treeId }}>
          {t('nav.back')}
        </Link>
      </Button>
      <Heading mt="2">{t('nav.events')}</Heading>
    </Box>
  );
}
