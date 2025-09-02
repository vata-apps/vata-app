import { ErrorState } from "@/components";
import { fetchTrees } from "@/db/trees/fetchTrees";
import { Container, SimpleGrid, Skeleton, Stack, Title } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CardCreateTree } from "./CardCreateTree";
import { CardTree } from "./CardTree";

export function TreesPage() {
  const {
    data: trees = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["trees"],
    queryFn: fetchTrees,
    placeholderData: keepPreviousData,
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

        {!isLoading && !error && (
          <SimpleGrid cols={2}>
            {trees.map((tree) => (
              <CardTree key={tree.id} tree={tree} />
            ))}

            <CardCreateTree />
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}
