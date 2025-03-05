import { fetchNames } from "@/api/fetchNames";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Names</CardTitle>
        <Button variant="secondary" size="sm">
          Add Name
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !names || names.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No names found
                </TableCell>
              </TableRow>
            ) : (
              names.map((name) => (
                <TableRow key={name.id}>
                  <TableCell>
                    {name.is_primary && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {name.first_name}
                  </TableCell>
                  <TableCell>{name.last_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{name.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
