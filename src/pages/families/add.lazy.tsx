import { createFamily } from "@/api/families/createFamily";
import { FamilyForm, PageHeader, type FamilyFormData } from "@/components";
import { useTree } from "@/hooks/use-tree";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/families/add")({
  component: AddFamilyPage,
});

function AddFamilyPage() {
  const { currentTreeId, isLoading: treeLoading } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createFamilyMutation = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      return createFamily(currentTreeId!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["families", currentTreeId],
      });

      showNotification({
        title: "Success",
        message: "Family created successfully",
        color: "green",
      });

      navigate({ to: "/families" });
    },
    onError: (error) => {
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        return "An unknown error occurred";
      })();

      showNotification({
        title: "Error",
        message: `Failed to create family: ${errorMessage}`,
        color: "red",
      });
    },
  });

  // Show loading state while tree is loading
  if (treeLoading) {
    return (
      <Container fluid>
        <Stack gap="xl" w="100%" align="flex-start">
          <PageHeader title="Add Family" />
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
          <PageHeader title="Add Family" />
          <div>No tree selected. Please select a tree first.</div>
        </Stack>
      </Container>
    );
  }

  const handleSubmit = async (values: FamilyFormData) => {
    if (!currentTreeId) {
      showNotification({
        title: "Error",
        message: "No tree selected. Please select a tree first.",
        color: "red",
      });
      return;
    }

    await createFamilyMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate({ to: "/families" });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%" align="flex-start">
        <PageHeader title="Add Family" />
        <FamilyForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={createFamilyMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
