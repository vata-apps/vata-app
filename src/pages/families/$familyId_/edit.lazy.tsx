import { fetchFamilyForPage } from "@/api/families/fetchFamilyForPage";
import { updateFamily } from "@/api/families/updateFamily";
import {
  ErrorState,
  FamilyForm,
  LoadingState,
  PageHeader,
  type FamilyFormData,
} from "@/components";
import { useTree } from "@/hooks/use-tree";
import { Container, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLazyFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

export const Route = createLazyFileRoute("/families/$familyId_/edit")({
  component: FamilyEditPage,
});

function FamilyEditPage() {
  const { familyId } = useParams({
    from: "/families/$familyId_/edit",
  });
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the current family data
  const {
    data: family,
    status: familyStatus,
    error: familyError,
  } = useQuery({
    queryKey: ["family", familyId],
    queryFn: () => fetchFamilyForPage(currentTreeId ?? "", familyId),
    enabled: Boolean(currentTreeId && familyId),
  });

  const updateFamilyMutation = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      return updateFamily(currentTreeId!, familyId, data);
    },
    onSuccess: async () => {
      showNotification({
        title: "Success",
        message: "Family updated successfully",
        color: "green",
      });

      // Invalidate all related queries that could be affected by the family update
      queryClient.invalidateQueries({
        queryKey: ["family", familyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["families", currentTreeId],
      });

      navigate({ to: `/families/${familyId}` });
    },
    onError: (error) => {
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        return "An unknown error occurred";
      })();

      showNotification({
        title: "Error",
        message: `Failed to update family: ${errorMessage}`,
        color: "red",
      });
    },
  });

  if (familyStatus === "pending") {
    return <LoadingState message="Loading family details..." />;
  }

  if (familyStatus === "error") {
    return <ErrorState error={familyError} backTo={`/families/${familyId}`} />;
  }

  if (!family) {
    return (
      <ErrorState error={new Error("Family not found")} backTo="/families" />
    );
  }

  // Transform family data to match FamilyForm format
  const initialValues: FamilyFormData = {
    id: family.id,
    husbandId: family.husband?.id || "",
    wifeId: family.wife?.id || "",
    type: family.type,
    children: family.children.map((child) => ({
      individualId: child.id,
    })),
  };

  const handleSubmit = async (values: FamilyFormData) => {
    await updateFamilyMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate({ to: `/families/${familyId}` });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%" align="flex-start">
        <PageHeader title="Edit Family" />
        <FamilyForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={updateFamilyMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
