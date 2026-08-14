/**
 * Toast primitive — a styled Base UI `Toast` assembly, driven by the
 * module-level `toastManager` (`src/lib/toast.ts`) so non-React code (the
 * QueryClient's `MutationCache`, the GEDCOM import flow) can raise a toast
 * without a hook.
 *
 * Mount `Toast.Provider` once at the app root (`main.tsx`), wrapping
 * everything, with `Toast.Viewport` somewhere inside it — it renders
 * whatever the shared manager queues, wherever it's mounted.
 */
import * as React from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { useTranslation } from 'react-i18next';

import { Icon } from '../icon';
import { IconButton } from './icon-button';
import { toastManager } from '$/lib/toast';
import * as styles from './toast.css';

function Provider({ children }: { children: React.ReactNode }): JSX.Element {
  return <BaseToast.Provider toastManager={toastManager}>{children}</BaseToast.Provider>;
}

function Viewport(): JSX.Element {
  const { toasts } = BaseToast.useToastManager();
  const { t } = useTranslation('common');

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className={styles.viewport}>
        {toasts.map((toast) => (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            className={styles.root({ type: toast.type === 'error' ? 'error' : undefined })}
          >
            <BaseToast.Title className={styles.title} />
            <BaseToast.Description className={styles.description} />
            <IconButton
              render={<BaseToast.Close />}
              className={styles.close}
              aria-label={t('toast.close')}
            >
              <Icon name="x" size={14} />
            </IconButton>
          </BaseToast.Root>
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

export const Toast = { Provider, Viewport };
