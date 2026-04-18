import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getSystemDebugData, listTreeDatabaseFiles } from '$/db/system/debug';
import { queryKeys } from '$lib/query-keys';
import { useAppStore } from '$/store/app-store';
import { cn } from '$lib/utils';

export function DebugDrawer() {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const open = useAppStore((s) => s.debugOpen);
  const toggleDebug = useAppStore((s) => s.toggleDebug);

  const { data: systemDebugData } = useQuery({
    queryKey: queryKeys.systemDebugData,
    queryFn: getSystemDebugData,
    enabled: open,
  });

  const { data: treeFiles } = useQuery({
    queryKey: queryKeys.treeFiles,
    queryFn: listTreeDatabaseFiles,
    enabled: open,
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && toggleDebug()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/55 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[70vh] flex-col border-t border-border bg-popover text-popover-foreground shadow-lg will-change-transform',
            'data-[state=open]:animate-drawer-up data-[state=closed]:animate-drawer-down'
          )}
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3.5">
            <DialogPrimitive.Title className="font-serif text-lg font-medium italic tracking-tight">
              {t('debug.show')}
            </DialogPrimitive.Title>
            <span className="flex-1" />
            <DialogPrimitive.Close
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={tc('actions.close')}
            >
              <X className="h-3.5 w-3.5" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex flex-1 flex-wrap gap-8 overflow-auto p-6">
            <div className="min-w-[200px] flex-1">
              <h3 className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {t('debug.treeFiles')}
              </h3>
              {treeFiles && treeFiles.length > 0 ? (
                <ul className="space-y-1">
                  {treeFiles.map((filename) => (
                    <li
                      key={filename}
                      className="rounded border border-border bg-muted/30 px-2 py-1 font-mono text-xs"
                    >
                      {filename}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t('debug.noTreeFiles')}</p>
              )}
            </div>

            <div className="min-w-[400px] flex-[2]">
              <h3 className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {t('debug.rawContent')}
              </h3>
              {systemDebugData ? (
                <pre className="max-h-full overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-xs">
                  {JSON.stringify(systemDebugData, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">{tc('status.loading')}</p>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
