import { useEffect } from 'react';
import { Link, useMatches } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Bug } from 'lucide-react';
import { ThemeToggle } from '$components/theme-toggle';
import { LanguageSelector } from '$components/language-selector';
import { DebugDrawer } from '$components/DebugDrawer';
import { useAppStore } from '$/store/app-store';
import { cn } from '$lib/utils';

const APP_VERSION = '0.1.0';

const ENTITY_TABS = [
  { key: 'individuals', path: '/tree/$treeId/individuals' },
  { key: 'families', path: '/tree/$treeId/families' },
  { key: 'sources', path: '/tree/$treeId/sources' },
  { key: 'repositories', path: '/tree/$treeId/repositories' },
] as const;

function useTreeId(): string | null {
  const matches = useMatches();
  for (const match of matches) {
    const params = match.params as Record<string, string>;
    if (params.treeId) return params.treeId;
  }
  return null;
}

function useActiveTab(): string | null {
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  if (!lastMatch) return null;

  const path = lastMatch.fullPath;
  for (const tab of ENTITY_TABS) {
    if (path.startsWith(tab.path.replace('$treeId', ''))) return tab.key;
  }

  const segments = path.split('/');
  const entitySegment = segments[3];
  if (entitySegment) {
    const found = ENTITY_TABS.find((tab) => tab.key === entitySegment);
    if (found) return found.key;
  }

  if (path.includes('/individual/')) return 'individuals';
  if (path.includes('/family/')) return 'families';
  if (path.includes('/source/')) return 'sources';
  if (path.includes('/repository/')) return 'repositories';

  return null;
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation();
  const treeId = useTreeId();
  const activeTab = useActiveTab();
  const debugOpen = useAppStore((s) => s.debugOpen);
  const toggleDebug = useAppStore((s) => s.toggleDebug);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDebug();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleDebug]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {treeId && (
        <header className="flex h-10 shrink-0 items-center border-b border-border bg-sidebar px-4">
          <Link
            to="/"
            className="mr-6 font-serif text-[15px] font-medium italic tracking-tight text-foreground hover:opacity-80"
          >
            {t('nav.home')}
          </Link>

          <nav className="flex items-center gap-0">
            {ENTITY_TABS.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                params={{ treeId }}
                className={cn(
                  'border-b-2 px-3 py-2 text-xs font-medium transition-colors',
                  activeTab === tab.key
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {t(`nav.${tab.key}`)}
              </Link>
            ))}
            {import.meta.env.DEV && (
              <Link
                to="/tree/$treeId/data"
                params={{ treeId }}
                className={cn(
                  'border-b-2 px-3 py-2 text-xs font-medium transition-colors',
                  activeTab === 'dataBrowser'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {t('nav.dataBrowser')}
              </Link>
            )}
          </nav>
        </header>
      )}

      <main className="flex-1 overflow-auto">{children}</main>

      <footer className="flex h-[52px] shrink-0 items-center gap-3.5 border-t border-border bg-sidebar px-[18px] font-mono text-[11px] text-muted-foreground">
        <span>Vata</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">v {APP_VERSION}</span>
        <span className="flex-1" />
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={toggleDebug}
            title={t(debugOpen ? 'debug.hide' : 'debug.show', { defaultValue: 'Debug' })}
            className={cn(
              'flex h-[26px] items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 font-mono text-[11px] transition-colors',
              'hover:bg-accent hover:text-foreground',
              debugOpen && 'border-primary/40 text-foreground'
            )}
          >
            <Bug className="h-3 w-3" />
            <span>Debug</span>
            <span className="rounded-sm border border-border bg-muted/60 px-1 text-[10px] leading-[14px]">
              ⌘D
            </span>
          </button>
        )}
        <span aria-hidden>·</span>
        <LanguageSelector />
        <ThemeToggle />
      </footer>

      {import.meta.env.DEV && <DebugDrawer />}
    </div>
  );
}
