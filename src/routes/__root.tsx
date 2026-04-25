import {
  createRootRoute,
  Outlet,
  useRouterState,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { AppShell } from '$components/app-shell';
import { Button } from '$components/ui/button';
import { useThemeSync } from '$hooks/useThemeSync';

function RootErrorComponent({ error }: ErrorComponentProps) {
  return (
    <AppShell>
      <div className="p-8 text-destructive">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <pre className="mt-2 whitespace-pre-wrap break-words text-sm">{error.message}</pre>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </AppShell>
  );
}

function RootComponent() {
  useThemeSync();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === '/') {
    return <Outlet />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});
