import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Heading } from '@radix-ui/themes';

interface SourceWorkspacePageProps {
  treeId: string;
  sourceId: string;
}

export function SourceWorkspacePage({ treeId, sourceId }: SourceWorkspacePageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('sources');
  return (
    <Box p="5">
      <Button asChild variant="ghost" color="gray" size="1">
        <Link to="/tree/$treeId/source/$sourceId" params={{ treeId, sourceId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <Heading mt="2">{t('workspaceHeading', { sourceId })}</Heading>
    </Box>
  );
}
