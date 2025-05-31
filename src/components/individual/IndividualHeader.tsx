// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IndividualWithRelations } from "@/types";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { Button, Group, Stack, ThemeIcon, Title } from "@mantine/core";
import { CalendarDays, Edit, Trash2, User } from "lucide-react";
import { GenderIcon } from "../GenderIcon";
import { PageCard } from "../PageCard";
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

  return (
    <PageCard>
      <Group justify="space-between" align="flex-start">
        <Group>
          <ThemeIcon
            size={60}
            radius="xl"
            variant="gradient"
            gradient={{ from: "blue.6", to: "blue.4", deg: 135 }}
          >
            <User size={24} />
          </ThemeIcon>

          <Stack gap="xs">
            <Title order={2} fw={600}>
              {displayedName}
            </Title>
            <Group gap="xs">
              <GenderIcon gender={individual.gender} size={16} />{" "}
              {capitalize(individual.gender)}
              <span>•</span>
              <CalendarDays size={16} />
              <AddIndividualInfo type="birth" />
              <span>•</span>
              <AddIndividualInfo type="death" />
            </Group>
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
            </Group>
          </Stack>
        </Group>

        <Group gap="sm">
          <Button
            variant="subtle"
            leftSection={<Edit size={16} />}
            onClick={() => {
              // TODO: Open edit form
              console.log("Edit individual:", individual.id);
            }}
          >
            Edit
          </Button>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => {
              // TODO: Delete individual
              console.log("Delete individual:", individual.id);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </Group>
      </Group>
    </PageCard>
  );
}
