import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { Badge, Group } from "@mantine/core";
import { PageHeader } from "../PageHeader";
import { FamilyWithRelations } from "./types";

/**
 * Displays the header card with family information
 */
function FamilyHeader({ family }: { family: FamilyWithRelations }) {
  const husbandName = family.husband
    ? displayName(family.husband.names)
    : "Unknown";
  const wifeName = family.wife ? displayName(family.wife.names) : "Unknown";
  const familyName = `${husbandName} & ${wifeName}`;
  const initials = `${husbandName?.[0] || "?"}${wifeName?.[0] || "?"}`;

  return (
    <PageHeader avatar={initials} backTo="/families" title={familyName}>
      <Group gap="xs">
        <Badge variant="default">{capitalize(family.type)}</Badge>
        <Badge variant="default">{family.children.length} children</Badge>
      </Group>
    </PageHeader>
  );
}

export default FamilyHeader;
