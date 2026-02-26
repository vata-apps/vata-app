interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return <div style={{ minHeight: '100vh' }}>{children}</div>;
}
