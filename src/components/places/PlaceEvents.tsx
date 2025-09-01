import { getPlaceEvents } from "@/api/getPlaceEvents";
import {
  Button,
  Stack,
  Text,
  Timeline,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ErrorState } from "../ErrorState";
import { EventIcon } from "../EventIcon";
import { LoadingState } from "../LoadingState";

interface Props {
  placeId: string;
  treeId: string;
}

export function PlaceEvents({ placeId, treeId }: Props) {
  const {
    data: events = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["placeEvents", placeId],
    queryFn: () => getPlaceEvents({ placeId, treeId }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <LoadingState message="Loading events..." />;

  if (error) return <ErrorState error={error} backTo="/places" />;

  return (
    <Stack gap="xs">
      <Title order={4}>Events</Title>

      <Timeline bulletSize={40} lineWidth={3}>
        {events.map((event, index) => (
          <Timeline.Item
            key={event.id}
            bullet={<EventIcon type={event.type?.key ?? ""} />}
            title={
              <UnstyledButton component={Link} to={`/events/${event.id}`}>
                {event.description}
              </UnstyledButton>
            }
            lineVariant={index === events.length - 1 ? "dashed" : "solid"}
          >
            <Text size="xs" mt={4}>
              {event.date}
            </Text>
          </Timeline.Item>
        ))}

        <Timeline.Item bullet={<IconPlus />}>
          <Button
            variant="default"
            component={Link}
            to={`/events/add?placeId=${placeId}`}
          >
            Add event
          </Button>
        </Timeline.Item>
      </Timeline>
    </Stack>
  );
}
