import { MainNavigationMenu } from "@/components/MainNavigationMenu";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <header className="border-b">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold">
              vata
            </Link>

            <MainNavigationMenu />
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </ThemeProvider>
  ),
});
