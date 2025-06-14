import { fetchFamiliesForTable } from "@/api/families/fetchFamiliesForTable";
import { useTree } from "@/lib/use-tree";
import displayName from "@/utils/displayName";
import { Loader, Stack, Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { TableRow } from "./TableRow";
import { Toolbar } from "./Toolbar";
import { FamilySort } from "./types";

export function TableFamilies() {
  const { currentTreeId } = useTree();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<FamilySort>("husband_last_name_asc");

  const [debouncedSearch] = useDebounce(search, 300);

  const families = useQuery({
    queryKey: ["families", currentTreeId],
    queryFn: () => fetchFamiliesForTable(currentTreeId ?? ""),
    enabled: Boolean(currentTreeId),
    placeholderData: keepPreviousData,
  });

  const data = useMemo(() => {
    if (!families.data) return [];

    let result = [...families.data];

    if (debouncedSearch) {
      result = result.filter((family) => {
        const husbandName = displayName(family.husband?.names);
        const husbandNameInverted = displayName(family.husband?.names, {
          part: "fullInverted",
        });
        const wifeName = displayName(family.wife?.names);
        const wifeNameInverted = displayName(family.wife?.names, {
          part: "fullInverted",
        });

        const regex = new RegExp(debouncedSearch, "i");

        return (
          regex.test(husbandName) ||
          regex.test(husbandNameInverted) ||
          regex.test(wifeName) ||
          regex.test(wifeNameInverted)
        );
      });
    }

    result = result.sort((a, b) => {
      const husbandFirstNameA = displayName(a.husband?.names, {
        part: "first",
      }).toLocaleLowerCase();
      const husbandFirstNameB = displayName(b.husband?.names, {
        part: "first",
      }).toLocaleLowerCase();

      const husbandLastNameA = displayName(a.husband?.names, {
        part: "last",
      }).toLocaleLowerCase();
      const husbandLastNameB = displayName(b.husband?.names, {
        part: "last",
      }).toLocaleLowerCase();

      const wifeFirstNameA = displayName(a.wife?.names, {
        part: "first",
      }).toLocaleLowerCase();
      const wifeFirstNameB = displayName(b.wife?.names, {
        part: "first",
      }).toLocaleLowerCase();

      const wifeLastNameA = displayName(a.wife?.names, {
        part: "last",
      }).toLocaleLowerCase();
      const wifeLastNameB = displayName(b.wife?.names, {
        part: "last",
      }).toLocaleLowerCase();

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

      if (sort === "husband_last_name_asc") {
        const husbandLastNameComparison = compareWithEmpty(
          husbandLastNameA,
          husbandLastNameB,
        );
        const husbandFirstNameComparison = compareWithEmpty(
          husbandFirstNameA,
          husbandFirstNameB,
        );

        return husbandLastNameComparison || husbandFirstNameComparison;
      }

      if (sort === "husband_last_name_desc") {
        const husbandLastNameComparison = compareWithEmpty(
          husbandLastNameA,
          husbandLastNameB,
          true,
        );
        const husbandFirstNameComparison = compareWithEmpty(
          husbandFirstNameA,
          husbandFirstNameB,
          true,
        );

        return husbandLastNameComparison || husbandFirstNameComparison;
      }

      if (sort === "husband_first_name_asc") {
        const husbandFirstNameComparison = compareWithEmpty(
          husbandFirstNameA,
          husbandFirstNameB,
        );
        const husbandLastNameComparison = compareWithEmpty(
          husbandLastNameA,
          husbandLastNameB,
        );

        return husbandFirstNameComparison || husbandLastNameComparison;
      }

      if (sort === "husband_first_name_desc") {
        const husbandFirstNameComparison = compareWithEmpty(
          husbandFirstNameA,
          husbandFirstNameB,
          true,
        );
        const husbandLastNameComparison = compareWithEmpty(
          husbandLastNameA,
          husbandLastNameB,
          true,
        );

        return husbandFirstNameComparison || husbandLastNameComparison;
      }

      if (sort === "wife_last_name_asc") {
        const wifeLastNameComparison = compareWithEmpty(
          wifeLastNameA,
          wifeLastNameB,
        );
        const wifeFirstNameComparison = compareWithEmpty(
          wifeFirstNameA,
          wifeFirstNameB,
        );

        return wifeLastNameComparison || wifeFirstNameComparison;
      }

      if (sort === "wife_last_name_desc") {
        const wifeLastNameComparison = compareWithEmpty(
          wifeLastNameA,
          wifeLastNameB,
          true,
        );
        const wifeFirstNameComparison = compareWithEmpty(
          wifeFirstNameA,
          wifeFirstNameB,
          true,
        );

        return wifeLastNameComparison || wifeFirstNameComparison;
      }

      if (sort === "wife_first_name_asc") {
        const wifeFirstNameComparison = compareWithEmpty(
          wifeFirstNameA,
          wifeFirstNameB,
        );
        const wifeLastNameComparison = compareWithEmpty(
          wifeLastNameA,
          wifeLastNameB,
        );

        return wifeFirstNameComparison || wifeLastNameComparison;
      }

      if (sort === "wife_first_name_desc") {
        const wifeFirstNameComparison = compareWithEmpty(
          wifeFirstNameA,
          wifeFirstNameB,
          true,
        );
        const wifeLastNameComparison = compareWithEmpty(
          wifeLastNameA,
          wifeLastNameB,
          true,
        );

        return wifeFirstNameComparison || wifeLastNameComparison;
      }

      return 0;
    });

    return result;
  }, [families.data, debouncedSearch, sort]);

  if (families.isLoading) return <Loader size="lg" />;

  return (
    <Stack>
      <Toolbar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
      />

      <Table
        highlightOnHover
        stickyHeader
        stickyHeaderOffset={60}
        verticalSpacing="md"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th w="100px">ID</Table.Th>
            <Table.Th w="300px">Husband</Table.Th>
            <Table.Th w="300px">Wife</Table.Th>
            <Table.Th>Children</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {data?.map((family) => (
            <TableRow
              key={family.id}
              family={family}
              sortedBy={
                sort.includes("first_name") ? "first_name" : "last_name"
              }
            />
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
