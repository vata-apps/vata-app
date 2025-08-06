import { createFamily } from "@/api/families/createFamily";
import { fetchIndividual } from "@/api/individuals/fetchIndividual";
import { FamilyForm, PageHeader, type FamilyFormData } from "@/components";
import { useTree } from "@/hooks/use-tree";
import displayName from "@/utils/displayName";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/families/add")({
  component: AddFamilyPage,
});

function AddFamilyPage() {
  const { currentTreeId, isLoading: treeLoading } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const preselectedIndividualId =
    new URLSearchParams(window.location.search).get("individualId") ||
    undefined;

  // Fetch individual data if preselected
  const { data: preselectedIndividual } = useQuery({
    queryKey: ["individual", preselectedIndividualId],
    queryFn: () =>
      fetchIndividual(currentTreeId ?? "", preselectedIndividualId!),
    enabled: Boolean(currentTreeId && preselectedIndividualId),
  });

  const createFamilyMutation = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      return createFamily(currentTreeId!, data);
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: ["families", currentTreeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["individuals", currentTreeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["individualForPage"],
      });

      showNotification({
        title: "Success",
        message: "Family created successfully",
        color: "green",
      });

      // Navigate back to individual page if we came from there, otherwise to families list
      if (preselectedIndividualId) {
        navigate({ to: `/individuals/${preselectedIndividualId}` });
      } else {
        navigate({ to: "/families" });
      }
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
    // Navigate back to individual page if we came from there, otherwise to families list
    if (preselectedIndividualId) {
      navigate({ to: `/individuals/${preselectedIndividualId}` });
    } else {
      navigate({ to: "/families" });
    }
  };

  // Generate page title
  const pageTitle = preselectedIndividual
    ? `Add Family for ${displayName(preselectedIndividual)}`
    : "Add Family";

  return (
    <Container fluid>
      <Stack gap="xl" w="100%" align="flex-start">
        <PageHeader title={pageTitle} />
        <FamilyForm
          mode="create"
          preselectedIndividualId={preselectedIndividualId}
          preselectedGender={preselectedIndividual?.gender}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={createFamilyMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
