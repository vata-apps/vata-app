// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IndividualWithRelations } from "@/types";
import displayName from "@/utils/displayName";
import { Badge, Group, Stack } from "@mantine/core";
import { CalendarDays } from "lucide-react";
import { GenderIcon } from "../GenderIcon";
import { PageHeader } from "../PageHeader";
import { AddFamilyMember } from "./AddFamilyMember";
import { AddIndividualInfo } from "./AddIndividualInfo";
import { FamilyMember } from "./FamilyMember";

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
    <PageHeader avatar={initials} backTo="/individuals" title={displayedName}>
      <Stack gap={4}>
        <Group gap="xs">
          {individual.family_as_child[0]?.family?.husband ? (
            <FamilyMember
              individual={individual.family_as_child[0].family.husband}
            />
          ) : (
            <>
              <GenderIcon gender="male" size={16} />
              <AddFamilyMember type="father" />
            </>
          )}

          <span>•</span>

          {individual.family_as_child[0]?.family?.wife ? (
            <FamilyMember
              individual={individual.family_as_child[0].family.wife}
            />
          ) : (
            <>
              <GenderIcon gender="female" size={16} />
              <AddFamilyMember type="mother" />
            </>
          )}

          <Badge variant="default">
            {individual.family_as_child[0]?.family?.children.length
              ? `${individual.family_as_child[0].family.children.length - 1} siblings`
              : "No siblings"}
          </Badge>

          <Badge variant="default">
            {individual.families_as_spouse.reduce(
              (acc, family) => acc + family.children.length,
              0,
            )}{" "}
            children
          </Badge>
        </Group>

        <Group gap="xs">
          <CalendarDays size={16} />
          <AddIndividualInfo type="birth" />
          <span>•</span>
          <AddIndividualInfo type="death" />
        </Group>
      </Stack>
    </PageHeader>
  );
}
