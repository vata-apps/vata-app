import { SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { TabDetailsTable } from "./TabDetailsTable";

export default function TabDetails() {
  return (
    <SimpleGrid cols={2} spacing="xl">
      <Stack>
        <TabDetailsTable />
      </Stack>
      <Stack>
        {/* MAPS HERE */}
        <Skeleton animate={false} height={300} radius="lg" />

        {/* MEDIAS HERE */}
        <SimpleGrid cols={{ base: 2, lg: 3 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} animate={false} height={200} radius="lg" />
          ))}
        </SimpleGrid>
      </Stack>
    </SimpleGrid>
  );
}
