import { Button, Card, Center } from "@mantine/core";

export function CardCreateTree() {
  const handleCreateTree = () => {
    // TODO: Implement tree creation
    console.log("Create new tree clicked");
  };

  return (
    <Card mih={150} radius="md" style={{ borderStyle: "dashed" }} withBorder>
      <Center h="100%">
        <Button radius="xl" variant="default" onClick={handleCreateTree}>
          Create tree
        </Button>
      </Center>
    </Card>
  );
}
