import { createRootRoute, Outlet, type ErrorComponentProps } from '@tanstack/react-router';
import { AppShell } from '$components/app-shell';
import { Button } from '$components/ui/button';

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

export const Route = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
  errorComponent: RootErrorComponent,
});
