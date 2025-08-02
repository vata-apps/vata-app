import { createIndividual } from "@/api/individuals/createIndividual";
import {
  IndividualForm,
  PageHeader,
  type IndividualFormData,
} from "@/components";
import { useTree } from "@/hooks/use-tree";
import displayName from "@/utils/displayName";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/individuals/add")({
  component: AddIndividualPage,
});

function AddIndividualPage() {
  const { currentTreeId, isLoading: treeLoading } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createIndividualMutation = useMutation({
    mutationFn: (data: IndividualFormData) => {
      return createIndividual(currentTreeId!, {
        gender: data.gender,
        names: data.names,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["individuals", currentTreeId],
      });

      const primaryName = displayName(variables.names[0]); // Since we only support one name now
      showNotification({
        title: "Success",
        message: `Individual "${primaryName}" created successfully`,
        color: "green",
      });

      navigate({ to: "/individuals" });
    },
    onError: (error) => {
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        return "An unknown error occurred";
      })();

      showNotification({
        title: "Error",
        message: `Failed to create individual: ${errorMessage}`,
        color: "red",
      });
    },
  });

  // Show loading state while tree is loading
  if (treeLoading) {
    return (
      <Container fluid>
        <Stack gap="xl" w="100%" align="flex-start">
          <PageHeader title="Add Individual" />
          <div>Loading tree data...</div>
        </Stack>
      </Container>
    );
  }

  // Show error if no tree is selected
  if (!currentTreeId) {
    return (
      <Container fluid>
        <Stack gap="xl" w="100%" align="flex-start">
          <PageHeader title="Add Individual" />
          <div>No tree selected. Please select a tree first.</div>
        </Stack>
      </Container>
    );
  }

  const handleSubmit = async (values: IndividualFormData) => {
    if (!currentTreeId) {
      showNotification({
        title: "Error",
        message: "No tree selected. Please select a tree first.",
        color: "red",
      });
      return;
    }

    await createIndividualMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate({ to: "/individuals" });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%" align="flex-start">
        <PageHeader title="Add Individual" />
        <IndividualForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={createIndividualMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
