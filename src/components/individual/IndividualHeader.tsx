import { GenderIcon } from "@/components/GenderIcon";
import { AddFamilyMember } from "@/components/individual/AddFamilyMember";
import { AddIndividualInfo } from "@/components/individual/AddIndividualInfo";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/database.types";
import displayName from "@/utils/displayName";
import { CalendarDays } from "lucide-react";

type IndividualWithRelations = {
  id: string;
  gender: Tables<"individuals">["gender"];
  names: Tables<"names">[];
  family_as_child: {
    family: {
      husband: {
        id: string;
        names: Tables<"names">[];
      } | null;
      wife: {
        id: string;
        names: Tables<"names">[];
      } | null;
      children: {
        individual: {
          id: string;
        };
      }[];
    } | null;
  }[];
  families_as_spouse: {
    children: {
      individual: {
        id: string;
      };
    }[];
  }[];
};

/**
 * Displays the header card with individual's information
 */
export function IndividualHeader({
  individual,
}: {
  individual: IndividualWithRelations;
}) {
  const names = individual.names || [];
  const displayedName = displayName(names);
  const initials = displayedName
    ? displayedName
        .split(" ")
        .map((n) => n?.[0] || "")
        .join("")
        .toUpperCase()
    : "??";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">
                  {displayName(individual.names)}
                </CardTitle>
                <GenderIcon gender={individual.gender} className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <AddIndividualInfo type="birth" />
                <span className="mx-2">•</span>
                <AddIndividualInfo type="death" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GenderIcon gender="male" className="h-4 w-4" />
                {individual.family_as_child[0]?.family?.husband ? (
                  <FamilyMember
                    individual={individual.family_as_child[0].family.husband}
                  />
                ) : (
                  <AddFamilyMember type="father" />
                )}
                <span className="mx-2">•</span>
                <GenderIcon gender="female" className="h-4 w-4" />
                {individual.family_as_child[0]?.family?.wife ? (
                  <FamilyMember
                    individual={individual.family_as_child[0].family.wife}
                  />
                ) : (
                  <AddFamilyMember type="mother" />
                )}
                <span className="mx-2">•</span>
                <span>
                  {individual.family_as_child[0]?.family?.children.length
                    ? `${individual.family_as_child[0].family.children.length - 1} siblings`
                    : "No siblings"}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {individual.families_as_spouse.reduce(
                    (acc, family) => acc + family.children.length,
                    0,
                  )}{" "}
                  children
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
