import {
  Button,
  Card,
  Center,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";

export function TreesPage() {
  return (
    <Container mx="auto" pt={128}>
      <Stack gap={64}>
        <Title ta="center">VATA - Family Trees</Title>

        <SimpleGrid cols={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card mih={150} radius="md" shadow="sm" withBorder>
              <Stack justify="space-between" h="100%">
                <Stack gap="xs">
                  <Text fz="lg" fw={500}>
                    Tree {index + 1}
                  </Text>
                </Stack>
                <Link
                  params={{ treeId: `${index + 1}` }}
                  style={{ width: "min-content" }}
                  to="/$treeId"
                >
                  <Button radius="xl" variant="default">
                    Open tree
                  </Button>
                </Link>
              </Stack>
            </Card>
          ))}

          <Card
            mih={150}
            radius="md"
            style={{ borderStyle: "dashed" }}
            withBorder
          >
            <Center h="100%">
              <Button disabled radius="xl" variant="default">
                Create tree
              </Button>
            </Center>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
