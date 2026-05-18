import { Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Heading, Link } from '@radix-ui/themes';

interface TreeViewPageProps {
  treeId: string;
}

export function TreeViewPage({ treeId }: TreeViewPageProps): JSX.Element {
  const { t } = useTranslation(['common', 'trees']);
  return (
    <Box p="5">
      <Heading mb="3">{t('trees:heading', { treeId })}</Heading>
      <Flex asChild direction="column" gap="2" align="start">
        <nav>
          <Link asChild>
            <RouterLink to="/tree/$treeId/individuals" params={{ treeId }}>
              {t('common:nav.individuals')}
            </RouterLink>
          </Link>
          <Link asChild>
            <RouterLink to="/tree/$treeId/families" params={{ treeId }}>
              {t('common:nav.families')}
            </RouterLink>
          </Link>
          <Link asChild>
            <RouterLink to="/">{t('common:nav.backToHome')}</RouterLink>
          </Link>
        </nav>
      </Flex>
    </Box>
  );
}
