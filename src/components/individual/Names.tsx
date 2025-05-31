import { fetchNames } from "@/api/fetchNames";
import { capitalize } from "@/utils/strings";
import { Badge, Button, Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { PageCard } from "../PageCard";

interface NamesProps {
  individualId: string;
}

/**
 * Component that displays a list of names with their types and actions
 */
export function Names({ individualId }: NamesProps) {
  const { data: names, isLoading } = useQuery({
    queryKey: ["names", individualId],
    queryFn: () => fetchNames(individualId),
    placeholderData: keepPreviousData,
  });

  return (
    <PageCard title="Names" icon={User} actionLabel="Add name">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={100} />
            <Table.Th>Name</Table.Th>
            <Table.Th>Last Name</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(() => {
            if (isLoading)
              return (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center">
                    Loading...
                  </Table.Td>
                </Table.Tr>
              );

            if (!names || names.length === 0)
              return (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center">
                    No names found
                  </Table.Td>
                </Table.Tr>
              );

            return names.map((name) => (
              <Table.Tr key={name.id}>
                <Table.Td>
                  {name.is_primary && <Badge variant="default">Default</Badge>}
                </Table.Td>
                <Table.Td>{name.first_name}</Table.Td>
                <Table.Td>{name.last_name}</Table.Td>
                <Table.Td>
                  <Badge variant="default">{capitalize(name.type)}</Badge>
                </Table.Td>
                <Table.Td ta="right">
                  <Button variant="default" size="xs">
                    Edit
                  </Button>
                </Table.Td>
              </Table.Tr>
            ));
          })()}
        </Table.Tbody>
      </Table>
    </PageCard>
  );
}
