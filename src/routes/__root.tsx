import { createRootRoute, Outlet, type ErrorComponentProps } from '@tanstack/react-router';
import { Button, Code, Flex, Heading } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

function RootErrorComponent({ error }: ErrorComponentProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <Flex direction="column" align="start" gap="3" p="6">
      <Heading size="6">{t('errors.generic')}</Heading>
      {import.meta.env.DEV && (
        <Code variant="soft" size="2" asChild>
          <pre>{error.message}</pre>
        </Code>
      )}
      <Button onClick={() => window.location.reload()}>{t('errors.reload')}</Button>
    </Flex>
  );
}

function RootComponent(): JSX.Element {
  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});
