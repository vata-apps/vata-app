import type { ReactNode } from 'react';

interface WorkspaceLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function WorkspaceLayout({ left, right }: WorkspaceLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex-1 overflow-auto border-r-2 border-border">{left}</div>
      <div className="w-[400px] overflow-auto bg-muted">{right}</div>
    </div>
  );
}
