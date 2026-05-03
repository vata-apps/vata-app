import { createRootRoute, Outlet, type ErrorComponentProps } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useApplyAppPreferences } from '$hooks/useApplyAppPreferences';

function RootErrorComponent({ error }: ErrorComponentProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div>
      <h1>{t('errors.generic')}</h1>
      {import.meta.env.DEV && <pre>{error.message}</pre>}
      <button onClick={() => window.location.reload()}>{t('errors.reload')}</button>
    </div>
  );
}

function RootComponent(): JSX.Element {
  useApplyAppPreferences();
  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});
