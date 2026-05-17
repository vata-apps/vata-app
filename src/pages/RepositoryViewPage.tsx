import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Heading } from '@radix-ui/themes';

interface RepositoryViewPageProps {
  treeId: string;
  repositoryId: string;
}

export function RepositoryViewPage({ treeId, repositoryId }: RepositoryViewPageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('repositories');
  return (
    <Box p="5">
      <Button asChild variant="ghost" color="gray" size="1">
        <Link to="/tree/$treeId/repositories" params={{ treeId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <Heading mt="2">{t('heading', { repositoryId })}</Heading>
    </Box>
  );
}
