import { Button, Code, Flex, Heading } from '@radix-ui/themes';
import { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Outlet,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function RootErrorComponent({ error }: ErrorComponentProps): JSX.Element {
  const { t } = useTranslation('common');

  const message = error instanceof Error ? error.message : String(error);

  return (
    <Flex direction="column" align="start" gap="3" p="6">
      <Heading size="6">{t('errors.generic')}</Heading>
      {import.meta.env.DEV && (
        <Code variant="soft" size="2" asChild>
          <pre>{message}</pre>
        </Code>
      )}
      <Button onClick={() => window.location.reload()}>{t('errors.reload')}</Button>
    </Flex>
  );
}

function RootComponent(): JSX.Element {
  return <Outlet />;
}

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});
