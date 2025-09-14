import { CardCreateTree } from "$/ui/components/CardCreateTree";
import { CardTree } from "$/ui/components/CardTree";
import { ErrorState } from "$/ui/components/system/ErrorState";
import { treeManager } from "$managers";
import {
  Container,
  SimpleGrid,
  Skeleton,
  Stack,
  Title,
  Text,
  Center,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

export function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["trees"],
    queryFn: treeManager.getAllTreesWithStatus,
  });

  return (
    <Container mx="auto" pt={128}>
      <Stack gap={64}>
        <Title ta="center">VATA - Family Trees</Title>

        {isLoading && (
          <SimpleGrid cols={3}>
            <Skeleton height={150} />
            <Skeleton height={150} />
            <Skeleton height={150} />
          </SimpleGrid>
        )}

        {!isLoading && error && <ErrorState error={error} />}

        {!isLoading && data && (
          <>
            {data.trees.length === 0 ? (
              <Center>
                <Stack align="center" gap="lg">
                  <Text size="lg" c="dimmed">
                    No family trees found
                  </Text>
                  <Text size="sm" c="dimmed">
                    Create your first family tree to get started
                  </Text>
                  <CardCreateTree />
                </Stack>
              </Center>
            ) : (
              <SimpleGrid cols={2}>
                {data.trees.map((tree) => (
                  <CardTree key={tree.id} tree={tree} />
                ))}
                <CardCreateTree />
              </SimpleGrid>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
