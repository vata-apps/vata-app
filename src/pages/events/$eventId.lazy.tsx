import { fetchEventForPage } from "@/api/events/fetchEventForPage";
import { ErrorState, LoadingState, PageHeader } from "@/components";
import { CardIndividual } from "@/components/CardIndividual";
import { useTree } from "@/hooks/use-tree";
import displayName from "@/utils/displayName";

import {
  Button,
  Code,
  Container,
  Grid,
  Group,
  Stack,
  Title,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { createLazyFileRoute } from "@tanstack/react-router";

const SUBJECT_ROLES = ["subject", "husband", "wife"];

export const Route = createLazyFileRoute("/events/$eventId")({
  component: EventPage,
});

function EventPage() {
  const { eventId } = Route.useParams();
  const { currentTreeId } = useTree();

  const { data, status, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventForPage(currentTreeId ?? "", eventId),
    enabled: Boolean(currentTreeId && eventId),
    placeholderData: keepPreviousData,
  });

  if (status === "pending") {
    return <LoadingState message="Loading event details..." />;
  }

  if (status === "error") {
    return <ErrorState error={error} backTo="/events" />;
  }

  const subjects = data.participants.filter((participant) =>
    SUBJECT_ROLES.includes(participant.role.key ?? ""),
  );
  const witnesses = data.participants.filter(
    (participant) => !SUBJECT_ROLES.includes(participant.role.key ?? ""),
  );

  return (
    <Container fluid>
      <Stack gap="xl" w="100%">
        <PageHeader
          avatar={<IconCalendar size={48} />}
          title={data.title}
          rightSection={<Code>{data.gedcomId}</Code>}
          metadata={[
            { title: "Place", value: data.place?.name ?? "Unknown" },
            { title: "Date", value: data.date ?? "Unknown" },
          ]}
        />

        <Grid gutter={64}>
          <Grid.Col span={6}>
            <Stack gap="xl">
              <Stack gap="xs">
                <Title order={4}>Subjects</Title>

                {subjects.map((subject) => (
                  <CardIndividual
                    key={subject.id}
                    individualId={subject.id}
                    lifeSpan={subject.lifeSpan}
                    name={displayName(subject)}
                    role={
                      subject.role.key !== "subject"
                        ? subject.role.name
                        : undefined
                    }
                  />
                ))}

                {data.type.key === "marriage" && subjects.length !== 2 && (
                  <Button variant="default">Add spouse</Button>
                )}
              </Stack>

              <Stack gap="xs">
                <Title order={4}>Witnesses</Title>

                {witnesses.length > 0 &&
                  witnesses.map((witness) => (
                    <CardIndividual
                      key={witness.id}
                      individualId={witness.id}
                      lifeSpan={witness.lifeSpan}
                      name={displayName(witness)}
                      role={witness.role.name}
                    />
                  ))}

                <Group>
                  <Button variant="default">Add witness</Button>
                </Group>
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={6}>
            <Stack gap="xl">
              <Stack gap="xs">
                <Title order={4}>Sources</Title>
                TODO
              </Stack>
              <Stack gap="xs">
                <Title order={4}>Medias</Title>
                TODO
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
