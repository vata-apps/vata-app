import { createFileRoute, Link } from "@tanstack/react-router";
import { useIndividualsWithNames } from "../../lib/hooks";

const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/individuals/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search?.page) || 1,
    };
  },
  component: IndividualsPage,
});

function IndividualsPage() {
  const { page } = Route.useSearch();
  const { data, isLoading, error } = useIndividualsWithNames(page);

  if (isLoading) {
    return <div>Loading individuals...</div>;
  }

  if (error) {
    return <div>Error loading individuals: {error.message}</div>;
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  return (
    <div>
      <h1>Individuals</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((individual) => {
            const primaryName = individual.names?.find(
              (name) => name.is_primary,
            );

            return (
              <tr key={individual.id}>
                <td>{individual.id}</td>
                <td>{primaryName?.first_name || "N/A"}</td>
                <td>{primaryName?.last_name || "N/A"}</td>
                <td>{individual.gender}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <Link
          disabled={page === 1}
          to="/individuals"
          search={{ page: page - 1 }}
          style={{ marginRight: "10px" }}
        >
          Previous
        </Link>
        Page {page} of {totalPages}
        <Link
          disabled={page === totalPages}
          to="/individuals"
          search={{ page: page + 1 }}
          style={{ marginLeft: "10px" }}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

export default IndividualsPage;
