import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Displays the family events section
 */
function FamilyEvents({ familyId }: { familyId: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Family Events</CardTitle>
        <Button variant="secondary" size="sm">
          Add Event
        </Button>
      </CardHeader>
      <CardContent>
        <p>No events recorded for family ID: {familyId}</p>
      </CardContent>
    </Card>
  );
}

export default FamilyEvents;
