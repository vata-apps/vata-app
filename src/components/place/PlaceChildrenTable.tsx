import type { RecursivePlaceWithType } from "@/api/fetchPlacesRecursively";
import { capitalize } from "@/utils/strings";
import { ActionIcon, Anchor, Badge, Group, Paper, Stack } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type PlaceChildrenTableProps = {
  readonly places: RecursivePlaceWithType[];
};

/**
 * Displays the places information using Paper components with collapse functionality
 */
export function PlaceChildrenTable({ places }: PlaceChildrenTableProps) {
  const [collapsedPlaces, setCollapsedPlaces] = useState<Set<string>>(
    new Set(),
  );

  // Helper function to check if a place has children
  const hasChildren = (placeId: string, level: number): boolean => {
    const placeIndex = places.findIndex((p) => p.id === placeId);
    if (placeIndex === -1) return false;

    // Check if the next place has a higher level (is a child)
    const nextPlace = places[placeIndex + 1];
    return nextPlace && nextPlace.level > level;
  };

  // Helper function to check if a place should be hidden
  const isPlaceHidden = (place: RecursivePlaceWithType): boolean => {
    // Check if any ancestor is collapsed
    for (let i = 0; i < places.length; i++) {
      const potentialAncestor = places[i];
      if (potentialAncestor.id === place.id) break;

      if (
        potentialAncestor.level < place.level &&
        collapsedPlaces.has(potentialAncestor.id)
      ) {
        // Check if this place is a descendant of the collapsed ancestor
        const ancestorIndex = places.findIndex(
          (p) => p.id === potentialAncestor.id,
        );
        const placeIndex = places.findIndex((p) => p.id === place.id);

        if (ancestorIndex < placeIndex) {
          // Check if there's no place with same or lower level between ancestor and current place
          let isDescendant = true;
          for (let j = ancestorIndex + 1; j < placeIndex; j++) {
            if (places[j].level <= potentialAncestor.level) {
              isDescendant = false;
              break;
            }
          }
          if (isDescendant) return true;
        }
      }
    }
    return false;
  };

  const toggleCollapse = (placeId: string): void => {
    setCollapsedPlaces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  };

  return (
    <Stack gap="md">
      {places.map((place) => {
        if (isPlaceHidden(place)) return null;

        const placeHasChildren = hasChildren(place.id, place.level);
        const isCollapsed = collapsedPlaces.has(place.id);

        return (
          <Group key={place.id} gap={0} wrap="nowrap" align="stretch">
            {/* Indentation outside the paper */}
            <div style={{ width: place.level * 24 }} />

            <Paper p="md" withBorder radius="lg" style={{ flex: 1 }}>
              <Group gap="md">
                {placeHasChildren && (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={() => toggleCollapse(place.id)}
                  >
                    {isCollapsed ? (
                      <ChevronRight size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </ActionIcon>
                )}
                <Anchor component={Link} to={`/places/${place.id}`} fw={500}>
                  {place.name}
                </Anchor>
                <Badge variant="default" size="md">
                  {capitalize(place.type.name)}
                </Badge>
              </Group>
            </Paper>
          </Group>
        );
      })}
    </Stack>
  );
}
