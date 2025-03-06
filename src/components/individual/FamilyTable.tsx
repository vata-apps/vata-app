import { AddFamilyMember } from "@/components/individual/AddFamilyMember";
import {
  FamilyMember,
  IndividualWithNames,
} from "@/components/individual/FamilyMember";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export type FamilyWithRelations = {
  id: string;
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
};

/**
 * Displays the table with family information
 */
export function FamilyTable({
  family,
  individualId,
}: {
  family: FamilyWithRelations | null | undefined;
  individualId: string;
}) {
  const siblings =
    family?.children?.filter((child) => child.individual.id !== individualId) ||
    [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Father</TableHead>
          <TableHead className="w-[250px]">Mother</TableHead>
          <TableHead>Siblings</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="min-h-[4rem]">
          <TableCell
            className={cn({
              "align-top py-4": Boolean(family?.husband),
            })}
          >
            {family?.husband ? (
              <FamilyMember individual={family.husband} />
            ) : (
              <AddFamilyMember type="father" />
            )}
          </TableCell>
          <TableCell
            className={cn({
              "align-top py-4": Boolean(family?.wife),
            })}
          >
            {family?.wife ? (
              <FamilyMember individual={family.wife} />
            ) : (
              <AddFamilyMember type="mother" />
            )}
          </TableCell>
          <TableCell
            className={cn({
              "align-top py-4": siblings.length > 0,
            })}
          >
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {siblings.map((child) => (
                <FamilyMember
                  key={child.individual.id}
                  individual={child.individual}
                />
              ))}
              {siblings.length === 0 && <AddFamilyMember type="sibling" />}
            </div>
          </TableCell>
          <TableCell className="text-right">
            {family && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/families/$familyId" params={{ familyId: family.id }}>
                  Edit
                </Link>
              </Button>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
