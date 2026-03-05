import { createRootRoute, Outlet, type ErrorComponentProps } from '@tanstack/react-router';
import { MainLayout } from '$components/layouts/MainLayout';

function RootErrorComponent({ error }: ErrorComponentProps) {
  return (
    <MainLayout>
      <div style={{ padding: '2rem', color: '#c00' }}>
        <h1>Something went wrong</h1>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error.message}</pre>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff',
          }}
        >
          Reload
        </button>
      </div>
    </MainLayout>
  );
}

export const Route = createRootRoute({
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
  errorComponent: RootErrorComponent,
});
