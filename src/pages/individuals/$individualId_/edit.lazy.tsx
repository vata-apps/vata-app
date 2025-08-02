import { fetchIndividual } from "@/api/individuals/fetchIndividual";
import { fetchIndividualNames } from "@/api/individuals/fetchIndividualNames";
import { updateIndividual } from "@/api/individuals/updateIndividual";
import {
  ErrorState,
  IndividualForm,
  LoadingState,
  PageHeader,
  type IndividualFormData,
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

export const Route = createLazyFileRoute("/individuals/$individualId_/edit")({
  component: IndividualEditPage,
});

function IndividualEditPage() {
  const { individualId } = useParams({
    from: "/individuals/$individualId_/edit",
  });
  const { currentTreeId } = useTree();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the current individual data
  const {
    data: individual,
    status: individualStatus,
    error: individualError,
  } = useQuery({
    queryKey: ["individual", individualId],
    queryFn: () => fetchIndividual(currentTreeId ?? "", individualId),
    enabled: Boolean(currentTreeId && individualId),
  });

  // Fetch the individual names
  const {
    data: names,
    status: namesStatus,
    error: namesError,
  } = useQuery({
    queryKey: ["individualNames", individualId],
    queryFn: () => fetchIndividualNames(currentTreeId ?? "", individualId),
    enabled: Boolean(currentTreeId && individualId),
  });

  const updateIndividualMutation = useMutation({
    mutationFn: (data: IndividualFormData) => {
      return updateIndividual(currentTreeId!, individualId, {
        gender: data.gender,
        names: data.names,
      });
    },
    onSuccess: async (_, variables) => {
      showNotification({
        title: "Success",
        message: `Individual "${variables.names[0]?.firstName} ${variables.names[0]?.lastName}" updated successfully`,
        color: "green",
      });

      // Invalidate all related queries that could be affected by the individual update
      queryClient.invalidateQueries({
        queryKey: ["individualForPage", individualId],
      });
      queryClient.invalidateQueries({
        queryKey: ["individualNames", individualId],
      });
      queryClient.invalidateQueries({
        queryKey: ["individuals", currentTreeId],
      });

      navigate({ to: `/individuals/${individualId}` });
    },
    onError: (error) => {
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        return "An unknown error occurred";
      })();

      showNotification({
        title: "Error",
        message: `Failed to update individual: ${errorMessage}`,
        color: "red",
      });
    },
  });

  if (individualStatus === "pending" || namesStatus === "pending") {
    return <LoadingState message="Loading individual details..." />;
  }

  if (individualStatus === "error") {
    return (
      <ErrorState
        error={individualError}
        backTo={`/individuals/${individualId}`}
      />
    );
  }

  if (namesStatus === "error") {
    return (
      <ErrorState error={namesError} backTo={`/individuals/${individualId}`} />
    );
  }

  if (!individual || !names) {
    return (
      <ErrorState
        error={new Error("Individual not found")}
        backTo="/individuals"
      />
    );
  }

  // Transform individual data to match IndividualForm format
  const initialValues: IndividualFormData = {
    id: individual.id,
    gender: individual.gender,
    names: names.map((name) => ({
      id: name.id,
      firstName: name.firstName,
      lastName: name.lastName,
      surname: name.surname || "",
      type: name.type,
    })),
  };

  const handleSubmit = async (values: IndividualFormData) => {
    await updateIndividualMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate({ to: `/individuals/${individualId}` });
  };

  return (
    <Container fluid>
      <Stack gap="xl" w="100%" align="flex-start">
        <PageHeader title="Edit Individual" />
        <IndividualForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isPending={updateIndividualMutation.isPending}
        />
      </Stack>
    </Container>
  );
}
