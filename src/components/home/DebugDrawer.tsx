import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { getSystemDebugData, listTreeDatabaseFiles } from '$/db/system/debug';
import { queryKeys } from '$lib/query-keys';
import { toErrorMessage } from '$lib/errors';

interface DebugDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function DebugDrawer({ open, onClose }: DebugDrawerProps) {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');

  const {
    data: systemDebugData,
    isError: isSystemDebugError,
    error: systemDebugError,
  } = useQuery({
    queryKey: queryKeys.systemDebugData,
    queryFn: getSystemDebugData,
    enabled: open && import.meta.env.DEV,
  });

  const {
    data: treeFiles,
    isError: isTreeFilesError,
    error: treeFilesError,
  } = useQuery({
    queryKey: queryKeys.treeFiles,
    queryFn: listTreeDatabaseFiles,
    enabled: open && import.meta.env.DEV,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!import.meta.env.DEV) return null;

  return (
    <>
      <div className="debug-drawer-scrim" data-open={open} onClick={onClose} aria-hidden="true" />
      <aside className="debug-drawer" data-open={open} aria-hidden={!open}>
        <div className="debug-drawer-head">
          <span className="debug-drawer-title">{t('statusbar.debug')}</span>
          <button
            type="button"
            className="btn btn-icon btn-ghost btn-sm"
            onClick={onClose}
            aria-label={tc('actions.close')}
          >
            <X strokeWidth={1.7} />
          </button>
        </div>
        <div className="debug-drawer-body">
          <section className="debug-drawer-section">
            <h3 className="debug-drawer-h3">{t('debug.treeFiles')}</h3>
            {isTreeFilesError ? (
              <p className="debug-drawer-muted">{toErrorMessage(treeFilesError)}</p>
            ) : treeFiles === undefined ? (
              <p className="debug-drawer-muted">{tc('status.loading')}</p>
            ) : treeFiles.length > 0 ? (
              <ul className="debug-drawer-list">
                {treeFiles.map((filename) => (
                  <li key={filename}>{filename}</li>
                ))}
              </ul>
            ) : (
              <p className="debug-drawer-muted">{t('debug.noTreeFiles')}</p>
            )}
          </section>
          <section className="debug-drawer-section debug-drawer-section-wide">
            <h3 className="debug-drawer-h3">{t('debug.rawContent')}</h3>
            {isSystemDebugError ? (
              <p className="debug-drawer-muted">{toErrorMessage(systemDebugError)}</p>
            ) : systemDebugData ? (
              <pre className="debug-drawer-pre">{JSON.stringify(systemDebugData, null, 2)}</pre>
            ) : (
              <p className="debug-drawer-muted">{tc('status.loading')}</p>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}
