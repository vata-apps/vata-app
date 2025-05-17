import { fetchNames } from "@/api/fetchNames";
import { capitalize } from "@/utils/strings";
import { Badge, Button, Group, Stack, Table } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
    <Stack gap="sm">
      <Group justify="space-between">
        <Button radius="xl" size="xs" variant="filled">
          Add name
        </Button>
      </Group>

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
    </Stack>
  );

  // return (
  //   <Card>
  //     <CardHeader className="flex flex-row items-center justify-between">
  //       <CardTitle>Names</CardTitle>
  //       <Button variant="secondary" size="sm">
  //         Add Name
  //       </Button>
  //     </CardHeader>
  //     <CardContent>
  //       <Table>
  //         <TableHeader>
  //           <TableRow>
  //             <TableHead className="w-[100px]"></TableHead>
  //             <TableHead>Name</TableHead>
  //             <TableHead>Last Name</TableHead>
  //             <TableHead>Type</TableHead>
  //             <TableHead className="text-right" />
  //           </TableRow>
  //         </TableHeader>
  //         <TableBody>
  //           {isLoading ? (
  //             <TableRow>
  //               <TableCell colSpan={5} className="text-center">
  //                 Loading...
  //               </TableCell>
  //             </TableRow>
  //           ) : !names || names.length === 0 ? (
  //             <TableRow>
  //               <TableCell colSpan={5} className="text-center">
  //                 No names found
  //               </TableCell>
  //             </TableRow>
  //           ) : (
  //             names.map((name) => (
  //               <TableRow key={name.id}>
  //                 <TableCell>
  //                   {name.is_primary && (
  //                     <Badge variant="secondary">Default</Badge>
  //                   )}
  //                 </TableCell>
  //                 <TableCell className="font-medium">
  //                   {name.first_name}
  //                 </TableCell>
  //                 <TableCell>{name.last_name}</TableCell>
  //                 <TableCell>
  //                   <Badge variant="outline">{name.type}</Badge>
  //                 </TableCell>
  //                 <TableCell className="text-right">
  //                   <Button variant="ghost" size="sm">
  //                     View
  //                   </Button>
  //                 </TableCell>
  //               </TableRow>
  //             ))
  //           )}
  //         </TableBody>
  //       </Table>
  //     </CardContent>
  //   </Card>
  // );
}
