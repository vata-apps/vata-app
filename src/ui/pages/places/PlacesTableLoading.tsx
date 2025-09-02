import { Skeleton, Table } from "@mantine/core";

export function PlacesTableLoading() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Table.Tr key={index}>
          <Table.Td colSpan={3}>
            <Skeleton animate height={30} />
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
}
