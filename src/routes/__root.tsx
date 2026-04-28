import { createRootRoute, Outlet, type ErrorComponentProps } from '@tanstack/react-router';

function RootErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button onClick={() => window.location.reload()}>Reload</button>
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
