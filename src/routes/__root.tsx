import { createRootRoute, Outlet, type ErrorComponentProps } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function RootErrorComponent({ error }: ErrorComponentProps) {
  const { t } = useTranslation('common');
  return (
    <div>
      <h1>{t('errors.generic')}</h1>
      <pre>{error.message}</pre>
      <button onClick={() => window.location.reload()}>{t('errors.reload')}</button>
    </div>
  );
}

function RootComponent() {
  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});
