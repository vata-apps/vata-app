import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import displayName from "@/utils/displayName";
import { Pencil } from "lucide-react";
import { FamilyWithRelations } from "./types";

/**
 * Displays the header card with family information
 */
function FamilyHeader({ family }: { family: FamilyWithRelations }) {
  const husbandName = family.husband
    ? displayName(family.husband.names)
    : "Unknown";
  const wifeName = family.wife ? displayName(family.wife.names) : "Unknown";
  const familyName = `${husbandName} & ${wifeName}`;
  const initials = `${husbandName?.[0] || "?"}${wifeName?.[0] || "?"}`;

  // Capitalize the family type
  const capitalizedType =
    family.type.charAt(0).toUpperCase() + family.type.slice(1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{familyName}</CardTitle>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="mt-1">
              <Badge variant="secondary">{capitalizedType}</Badge>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{family.children.length} children</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export default FamilyHeader;
