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
import { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export type FamilyWithRelations = {
  id: Tables<"families">["id"];
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
};

/**
 * Displays a table of families where the individual is a spouse
 */
export function FamiliesAsSpouseTable({
  families,
  individualId,
}: {
  families: FamilyWithRelations[];
  individualId: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Spouse</TableHead>
          <TableHead>Children</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {families.map((family) => {
          const spouse =
            family.husband?.id === individualId ? family.wife : family.husband;

          return (
            <TableRow key={family.id} className="min-h-[4rem]">
              <TableCell
                className={cn({
                  "align-top py-4": Boolean(spouse),
                })}
              >
                {spouse ? (
                  <FamilyMember individual={spouse} />
                ) : (
                  <AddFamilyMember type="father" />
                )}
              </TableCell>
              <TableCell
                className={cn({
                  "align-top py-4": family.children.length > 0,
                })}
              >
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {family.children.map((child) => (
                    <FamilyMember
                      key={child.individual.id}
                      individual={child.individual}
                    />
                  ))}
                  {family.children.length === 0 && (
                    <AddFamilyMember type="sibling" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/families/$familyId"
                    params={{ familyId: family.id }}
                  >
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
