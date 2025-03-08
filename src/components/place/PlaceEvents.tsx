import {
  FamilyMember,
  IndividualWithNames,
} from "@/components/individual/FamilyMember";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Enums } from "@/database.types";
import { Link } from "@tanstack/react-router";
import { Pencil, UserIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Capitalizes the first letter of each word in a string
 */
function capitalize(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

type IndividualEvent = {
  id: string;
  type: string;
  individual: {
    id: string;
    name: string;
    gender: Enums<"gender">;
    names: { first_name: string; last_name: string; is_primary: boolean }[];
  };
  date: string;
  eventType: "individual";
  place?: {
    id: string;
    name: string;
  } | null;
  description?: string;
};

type FamilyEvent = {
  id: string;
  type: string;
  family: string;
  familyId: string;
  date: string;
  eventType: "family";
  place?: {
    id: string;
    name: string;
  } | null;
  description?: string;
};

type Event = IndividualEvent | FamilyEvent;

type PlaceEventsProps = {
  placeId: string;
};

export function PlaceEvents({ placeId }: PlaceEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [placeName, setPlaceName] = useState("this place");

  useEffect(() => {
    // This would normally fetch events from the API
    // For now, we're using mock data
    const fetchEvents = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock place name (in a real app, this would come from the API)
      const mockPlaceName = "New York City";
      setPlaceName(mockPlaceName);

      const mockIndividualEvents: IndividualEvent[] = [
        {
          id: "1",
          type: "birth",
          individual: {
            id: "ind1",
            name: "John Doe",
            gender: "male",
            names: [{ first_name: "John", last_name: "Doe", is_primary: true }],
          },
          date: "1980-05-15",
          eventType: "individual",
          place: { id: placeId, name: mockPlaceName },
          description: "Born at Memorial Hospital",
        },
        {
          id: "2",
          type: "death",
          individual: {
            id: "ind2",
            name: "Jane Smith",
            gender: "female",
            names: [
              { first_name: "Jane", last_name: "Smith", is_primary: true },
            ],
          },
          date: "2010-11-22",
          eventType: "individual",
          place: { id: placeId, name: mockPlaceName },
          description: "Passed away at home",
        },
      ];

      const mockFamilyEvents: FamilyEvent[] = [
        {
          id: "1",
          type: "marriage",
          family: "Smith-Johnson Family",
          familyId: "fam1",
          date: "1975-06-30",
          eventType: "family",
          place: { id: placeId, name: mockPlaceName },
          description: "Ceremony at St. Patrick's Cathedral",
        },
        {
          id: "2",
          type: "divorce",
          family: "Brown-Davis Family",
          familyId: "fam2",
          date: "2005-03-12",
          eventType: "family",
          place: { id: placeId, name: mockPlaceName },
          description: "Filed at County Courthouse",
        },
      ];

      // Combine and sort all events by date
      const allEvents: Event[] = [
        ...mockIndividualEvents,
        ...mockFamilyEvents,
      ].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setEvents(allEvents);
      setIsLoading(false);
    };

    fetchEvents();
  }, [placeId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading events...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events at {placeName}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Person/Family</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={`${event.eventType}-${event.id}`}>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {event.eventType === "individual" ? (
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Badge variant="outline">{capitalize(event.type)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.eventType === "individual" ? (
                      <FamilyMember
                        individual={event.individual as IndividualWithNames}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-6 p-0"
                        >
                          <Link
                            to="/families/$familyId"
                            params={{ familyId: event.familyId }}
                          >
                            {event.family}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      {event.eventType === "individual" ? (
                        <Link
                          to="/individuals/$individualId"
                          params={{ individualId: event.individual.id }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      ) : (
                        <Link
                          to="/families/$familyId"
                          params={{ familyId: event.familyId }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-muted-foreground text-center py-8">
            No events found at {placeName}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
