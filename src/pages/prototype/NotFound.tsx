import { Link } from "@tanstack/react-router";

/**
 * 404 Not Found page component
 */
export function NotFoundPage() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
        Go back to Tree Management
      </Link>
    </div>
  );
}
