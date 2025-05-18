import { capitalize } from "@/utils/strings";
import { Badge, Group } from "@mantine/core";
import { PageHeader } from "../PageHeader";

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
    type: {
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
  const getParentHierarchy = () => {
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

    return hierarchy
      .map((parent) => parent.name)
      .reverse()
      .join(" - ");
  };

  const parentLocation =
    getParentHierarchy() || place.parent?.name || "No parent location";
  const coordinates =
    place.latitude && place.longitude
      ? `${place.latitude}, ${place.longitude}`
      : "No coordinates";

  return (
    <PageHeader backTo="/places" title={place.name}>
      <Group gap="xs">
        <Badge variant="default">{capitalize(place.type.name)}</Badge>
        <Badge variant="default">{parentLocation}</Badge>
        <Badge variant="default">{coordinates}</Badge>
      </Group>
    </PageHeader>
  );
}
