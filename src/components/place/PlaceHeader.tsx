import { PageCard } from "@/components/PageCard";
import { capitalize } from "@/utils/strings";
import {
  Anchor,
  Breadcrumbs,
  Button,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Edit, MapPin, MapPinned, Tag, Trash2 } from "lucide-react";

// Define a recursive type for the parent hierarchy
type ParentPlace = {
  id: string;
  name: string;
  parent: ParentPlace | null;
};

type PlaceHeaderProps = {
  place: {
    id: string;
    name: string;
    place_type: {
      name: string;
    };
    parent?: ParentPlace | null;
    latitude?: number | null;
    longitude?: number | null;
  };
};

/**
 * Displays the header card with place information
 */
export function PlaceHeader({ place }: PlaceHeaderProps) {
  // Build the parent hierarchy from the recursive parent structure
  const getParentHierarchy = (): ParentPlace[] | null => {
    if (!place.parent) return null;

    // Function to flatten the recursive parent structure into an array
    const flattenParentHierarchy = (
      parent: ParentPlace,
      hierarchy: ParentPlace[] = [],
    ): ParentPlace[] => {
      hierarchy.push(parent);
      if (parent.parent) {
        return flattenParentHierarchy(parent.parent, hierarchy);
      }
      return hierarchy;
    };

    const hierarchy = flattenParentHierarchy(place.parent);
    return hierarchy.reverse(); // Reverse to show from top-level to immediate parent
  };

  const parentHierarchy = getParentHierarchy();
  const coordinates =
    place.latitude && place.longitude
      ? `${place.latitude}, ${place.longitude}`
      : null;

  return (
    <PageCard>
      <Group justify="space-between" align="flex-start">
        <Group>
          <ThemeIcon
            size={60}
            radius="xl"
            variant="gradient"
            gradient={{ from: "green.6", to: "green.4", deg: 135 }}
          >
            <MapPin size={24} />
          </ThemeIcon>
          <Stack gap="xs">
            <Title order={2} fw={600}>
              {place.name}
            </Title>
            <Group gap="xl">
              <Group gap="xs">
                <Tag size={16} />
                <Text size="md">{capitalize(place.place_type.name)}</Text>
              </Group>
              {parentHierarchy && (
                <Group gap="xs">
                  <MapPin size={16} />
                  <Breadcrumbs separator="→">
                    {parentHierarchy.map((parent) => (
                      <Anchor
                        key={parent.id}
                        component={Link}
                        to={`/places/${parent.id}`}
                        size="md"
                        style={{ textDecoration: "none" }}
                      >
                        {parent.name}
                      </Anchor>
                    ))}
                  </Breadcrumbs>
                </Group>
              )}
              {coordinates && (
                <Group gap="xs">
                  <MapPinned size={16} />
                  <Text size="md">{coordinates}</Text>
                </Group>
              )}
            </Group>
          </Stack>
        </Group>

        <Group gap="sm">
          <Button
            variant="subtle"
            leftSection={<Edit size={16} />}
            onClick={() => {
              // TODO: Open edit form
              console.log("Edit place:", place.id);
            }}
          >
            Edit
          </Button>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => {
              // TODO: Delete place
              console.log("Delete place:", place.id);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </Group>
      </Group>
    </PageCard>
  );
}
