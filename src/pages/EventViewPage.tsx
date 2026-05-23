import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Heading } from '@radix-ui/themes';

interface EventViewPageProps {
  treeId: string;
  eventId: string;
}

export function EventViewPage({ treeId, eventId }: EventViewPageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('events');
  return (
    <Box p="5">
      <Button asChild variant="ghost" color="gray" size="1">
        <Link to="/tree/$treeId/events" params={{ treeId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <Heading mt="2">{t('heading', { eventId })}</Heading>
    </Box>
  );
}
