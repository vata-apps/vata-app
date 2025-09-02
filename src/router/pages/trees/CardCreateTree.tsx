import { Button, Card, Center } from "@mantine/core";

export function CardCreateTree() {
  return (
    <Card mih={150} radius="md" style={{ borderStyle: "dashed" }} withBorder>
      <Center h="100%">
        <Button radius="xl" variant="default">
          Create tree
        </Button>
      </Center>
    </Card>
  );
}
