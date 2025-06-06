import { fetchIndividualsForTable } from "@/api/individuals";
import { IndividualGender, IndividualSort } from "@/api/individuals/types";
import { useTree } from "@/lib/use-tree";
import { Loader, Stack, Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { TableRow } from "./TableRow";
import { Toolbar } from "./Toolbar";

interface TableIndividualsProps {
  hideToolbar?: boolean;
  individualIds?: string[];
}

export function TableIndividuals({
  hideToolbar = false,
  individualIds,
}: TableIndividualsProps) {
  const { currentTreeId } = useTree();

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<IndividualGender>("all");
  const [sort, setSort] = useState<IndividualSort>("last_name_asc");

  const [debouncedSearch] = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: [
      "individuals",
      currentTreeId,
      debouncedSearch,
      gender,
      sort,
      individualIds,
    ],
    queryFn: () =>
      fetchIndividualsForTable(currentTreeId ?? "", {
        gender,
        individualIds,
        search: debouncedSearch,
        sort,
      }),
    enabled: Boolean(currentTreeId),
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <Loader size="lg" />;

  return (
    <Stack>
      {!hideToolbar && (
        <Toolbar
          search={search}
          setSearch={setSearch}
          gender={gender}
          setGender={setGender}
          sort={sort}
          setSort={setSort}
        />
      )}

      <Table
        highlightOnHover
        stickyHeader
        stickyHeaderOffset={60}
        verticalSpacing="md"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>First name</Table.Th>
            <Table.Th>Last name</Table.Th>
            <Table.Th>Gender</Table.Th>
            <Table.Th>Birth</Table.Th>
            <Table.Th>Death</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {data?.map((individual) => (
            <TableRow key={individual.id} individual={individual} />
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
