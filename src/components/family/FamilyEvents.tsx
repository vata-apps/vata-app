import { Stack, Text, Title } from "@mantine/core";

/**
 * Displays the family events section
 */
function FamilyEvents({ familyId }: { familyId: string }) {
  return (
    <Stack gap="sm">
      <Title order={4}>Family Events</Title>
      <Text>No events recorded for family ID: {familyId}</Text>
    </Stack>
  );
}

export default FamilyEvents;
