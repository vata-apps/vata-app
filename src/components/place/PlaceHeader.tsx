import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Globe, MapPinIcon, Pencil } from "lucide-react";

/**
 * Capitalizes the first letter of each word in a string
 */
function capitalize(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

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

    return (
      <span>
        {hierarchy.map((parent, index) => (
          <span key={parent.id}>
            <Link
              to="/places/$placeId"
              params={{ placeId: parent.id }}
              className="text-primary hover:underline"
            >
              {parent.name}
            </Link>
            {index < hierarchy.length - 1 ? " - " : ""}
          </span>
        ))}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{place.name}</CardTitle>
              <Badge variant="secondary">{capitalize(place.type.name)}</Badge>
            </div>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              {place.parent ? (
                <span>
                  Part of{" "}
                  {getParentHierarchy() || (
                    <Link
                      to="/places/$placeId"
                      params={{ placeId: place.parent.id }}
                      className="text-primary hover:underline"
                    >
                      {place.parent.name}
                    </Link>
                  )}
                </span>
              ) : (
                <span>No parent location</span>
              )}

              <span className="mx-2">•</span>
              <MapPinIcon className="h-4 w-4" />
              {place.latitude && place.longitude ? (
                <span>
                  {place.latitude}, {place.longitude}
                </span>
              ) : (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <span className="ml-1">Add coordinates</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
