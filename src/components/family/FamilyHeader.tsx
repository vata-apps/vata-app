import { PageCard } from "@/components/PageCard";
import { FamilyWithRelations } from "@/types";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { Badge, Button, Group, Stack, ThemeIcon, Title } from "@mantine/core";
import { Edit, Trash2, Users } from "lucide-react";

/**
 * Displays the header card with family information
 */
function FamilyHeader({ family }: { family: FamilyWithRelations }) {
  const husbandName = family.husband
    ? displayName(family.husband.names)
    : "Unknown";
  const wifeName = family.wife ? displayName(family.wife.names) : "Unknown";
  const familyName = `${husbandName} & ${wifeName}`;

  return (
    <PageCard>
      <Group justify="space-between" align="flex-start">
        <Group>
          <ThemeIcon
            size={60}
            radius="xl"
            variant="gradient"
            gradient={{ from: "violet.6", to: "violet.4", deg: 135 }}
          >
            <Users size={24} />
          </ThemeIcon>
          <Stack gap="xs">
            <Title order={2} fw={600}>
              {familyName}
            </Title>
            <Group gap="md">
              <Badge variant="default">{capitalize(family.type)}</Badge>
              <Badge variant="default">{family.children.length} children</Badge>
            </Group>
          </Stack>
        </Group>

        <Group gap="sm">
          <Button
            variant="subtle"
            leftSection={<Edit size={16} />}
            onClick={() => {
              // TODO: Open edit form
              console.log("Edit family:", family.id);
            }}
          >
            Edit
          </Button>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => {
              // TODO: Delete family
              console.log("Delete family:", family.id);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </Group>
      </Group>
    </PageCard>
  );
}

export default FamilyHeader;
