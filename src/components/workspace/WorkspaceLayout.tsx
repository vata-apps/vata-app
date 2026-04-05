import type { ReactNode } from 'react';

interface WorkspaceLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function WorkspaceLayout({ left, right }: WorkspaceLayoutProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, overflow: 'auto', borderRight: '2px solid #ddd' }}>{left}</div>
      <div style={{ width: '400px', overflow: 'auto', background: '#fafafa' }}>{right}</div>
    </div>
  );
}
