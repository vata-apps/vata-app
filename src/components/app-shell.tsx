import { Link, useMatches } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '$components/theme-toggle';
import { LanguageSelector } from '$components/language-selector';
import { cn } from '$lib/utils';

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

  // Check by path segment
  const segments = path.split('/');
  const entitySegment = segments[3]; // /tree/:treeId/<entity>
  if (entitySegment) {
    const found = ENTITY_TABS.find((tab) => tab.key === entitySegment);
    if (found) return found.key;
  }

  // Individual/family detail pages
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-10 shrink-0 items-center border-b px-4">
        <Link to="/" className="mr-6 text-sm font-bold tracking-tight hover:opacity-80">
          {t('nav.home')}
        </Link>

        {treeId && (
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
        )}

        <div className="ml-auto flex items-center gap-1">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
