import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header className="p-4 border-b">
        <nav>
          <ul className="flex gap-4">
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/individuals" className="hover:underline">
                Individuals
              </Link>
            </li>
            <li>
              <Link to="/families" className="hover:underline">
                Families
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </>
  ),
});
