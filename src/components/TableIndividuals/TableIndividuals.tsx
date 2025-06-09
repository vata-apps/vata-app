import { fetchIndividualsForTable } from "@/api/individuals";
import { IndividualGender, IndividualSort } from "@/api/individuals/types";
import { useTree } from "@/lib/use-tree";
import { Loader, Stack, Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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

  const individuals = useQuery({
    queryKey: ["individuals", currentTreeId, individualIds],
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

  const data = useMemo(() => {
    if (!individuals.data) return [];

    let result = [...individuals.data];

    if (debouncedSearch) {
      result = result.filter((individual) => {
        const completeName = `${individual.firstName} ${individual.lastName}`;
        const completeNameInverted = `${individual.lastName} ${individual.firstName}`;
        const regex = new RegExp(debouncedSearch, "i");
        return (
          regex.test(completeName) ||
          regex.test(completeNameInverted) ||
          regex.test(individual.birth.place ?? "") ||
          regex.test(individual.death.place ?? "")
        );
      });
    }

    if (gender !== "all") {
      result = result.filter((individual) => individual.gender === gender);
    }

    // Helper function to compare names while pushing empty values to the end
    const compareWithEmpty = (
      nameA: string,
      nameB: string,
      desc = false,
    ): number => {
      const isEmptyA = !nameA || nameA.trim() === "";
      const isEmptyB = !nameB || nameB.trim() === "";

      if (isEmptyA && isEmptyB) return 0;
      if (isEmptyA) return 1; // Push empty A to the end
      if (isEmptyB) return -1; // Push empty B to the end

      return desc ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    };

    result = result.sort((a, b) => {
      const firstNameA = a.firstName?.toLocaleLowerCase() ?? "";
      const firstNameB = b.firstName?.toLocaleLowerCase() ?? "";
      const lastNameA = a.lastName?.toLocaleLowerCase() ?? "";
      const lastNameB = b.lastName?.toLocaleLowerCase() ?? "";

      if (sort === "last_name_asc") {
        const lastNameComparison = compareWithEmpty(lastNameA, lastNameB);
        const firstNameComparison = compareWithEmpty(firstNameA, firstNameB);

        return lastNameComparison || firstNameComparison;
      }

      if (sort === "last_name_desc") {
        const lastNameComparison = compareWithEmpty(lastNameA, lastNameB, true);
        const firstNameComparison = compareWithEmpty(
          firstNameA,
          firstNameB,
          true,
        );

        return lastNameComparison || firstNameComparison;
      }

      if (sort === "first_name_asc") {
        const firstNameComparison = compareWithEmpty(firstNameA, firstNameB);
        const lastNameComparison = compareWithEmpty(lastNameA, lastNameB);

        return firstNameComparison || lastNameComparison;
      }

      if (sort === "first_name_desc") {
        const firstNameComparison = compareWithEmpty(
          firstNameA,
          firstNameB,
          true,
        );
        const lastNameComparison = compareWithEmpty(lastNameA, lastNameB, true);

        return firstNameComparison || lastNameComparison;
      }

      return 0;
    });

    return result;
  }, [individuals.data, debouncedSearch, gender, sort]);

  if (individuals.isLoading) return <Loader size="lg" />;

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
