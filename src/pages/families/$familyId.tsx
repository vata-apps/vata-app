import { fetchFamily } from "@/api/fetchFamily";
import { GenderIcon } from "@/components/GenderIcon";
import { AddIndividualInfo } from "@/components/individual/AddIndividualInfo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from "@/database.types";
import displayName from "@/utils/displayName";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";

export const Route = createFileRoute("/families/$familyId")({
  component: FamilyPage,
});

type IndividualWithNames = {
  id: string;
  gender: Tables<"individuals">["gender"];
  names: Tables<"names">[];
};

type FamilyWithRelations = {
  id: string;
  husband: IndividualWithNames | null;
  wife: IndividualWithNames | null;
  children: {
    individual: IndividualWithNames;
  }[];
};

/**
 * Displays the family page with husband, wife, and children information
 */
function FamilyPage() {
  const { familyId } = Route.useParams();

  const {
    data: family,
    status,
    error,
  } = useQuery({
    queryKey: ["family", familyId],
    queryFn: () => fetchFamily(familyId),
    placeholderData: keepPreviousData,
  });

  if (status === "pending") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Loading...</CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Error loading family: {error.message}</CardHeader>
        </Card>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>Family not found</CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section */}
      <FamilyHeader family={family} />

      {/* Tabs Section */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="members">Family Members</TabsTrigger>
          <TabsTrigger value="events">Family Events</TabsTrigger>
        </TabsList>

        {/* Family Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <FamilyMembers family={family} />
        </TabsContent>

        {/* Family Events Tab */}
        <TabsContent value="events">
          <FamilyEvents familyId={familyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

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

  // Determine family type
  let familyType = "unknown";

  // For demonstration purposes - in a real implementation, this would come from the database
  // This is just a placeholder to show the different types
  if (family.husband && family.wife) {
    // Randomly choose between married and civil union for demo purposes
    familyType = Math.random() > 0.5 ? "married" : "civil union";
  } else if ((family.husband || family.wife) && family.children.length > 0) {
    familyType = "unmarried";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{familyName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Type: {familyType}
                </p>
              </div>
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

/**
 * Displays the family members section
 */
function FamilyMembers({ family }: { family: FamilyWithRelations }) {
  // Sample data for demonstration
  const birthData = {
    husband: {
      date: "15 May 1975",
      place: "Montreal, Canada",
    },
    wife: {
      date: "23 August 1978",
      place: "Quebec City, Canada",
    },
    children: [
      {
        date: "12 June 2005",
        place: "Ottawa, Canada",
      },
      {
        date: "3 September 2008",
        place: "Toronto, Canada",
      },
    ],
  };

  // For demonstration, we'll show data for some members and buttons for others
  const showHusbandBirth = true;
  const showHusbandDeath = false;
  const showWifeBirth = false;
  const showWifeDeath = false;
  const showChildBirth = [true, false];
  const showChildDeath = [false, false];

  /**
   * Renders event information with icons
   */
  function EventInfo({ date, place }: { date: string; place: string }) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{place}</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Family Members</CardTitle>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/individuals">Add Member</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Parents Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Parents</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-1/3">Name</TableHead>
                  <TableHead className="w-1/3">Birth</TableHead>
                  <TableHead className="w-1/3">Death</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {family.husband && (
                  <TableRow>
                    <TableCell className="align-top">
                      <GenderIcon gender="male" className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="align-top font-medium">
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: family.husband.id }}
                        className="hover:underline"
                      >
                        {displayName(family.husband.names)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm align-top">
                      {showHusbandBirth ? (
                        <EventInfo
                          date={birthData.husband.date}
                          place={birthData.husband.place}
                        />
                      ) : (
                        <AddIndividualInfo type="birth" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm align-top">
                      {showHusbandDeath ? (
                        <EventInfo
                          date="10 January 2020"
                          place="Vancouver, Canada"
                        />
                      ) : (
                        <AddIndividualInfo type="death" />
                      )}
                    </TableCell>
                  </TableRow>
                )}
                {family.wife && (
                  <TableRow>
                    <TableCell className="align-top">
                      <GenderIcon gender="female" className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="align-top font-medium">
                      <Link
                        to="/individuals/$individualId"
                        params={{ individualId: family.wife.id }}
                        className="hover:underline"
                      >
                        {displayName(family.wife.names)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm align-top">
                      {showWifeBirth ? (
                        <EventInfo
                          date={birthData.wife.date}
                          place={birthData.wife.place}
                        />
                      ) : (
                        <AddIndividualInfo type="birth" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm align-top">
                      {showWifeDeath ? (
                        <EventInfo
                          date="5 March 2022"
                          place="Montreal, Canada"
                        />
                      ) : (
                        <AddIndividualInfo type="death" />
                      )}
                    </TableCell>
                  </TableRow>
                )}
                {!family.husband && !family.wife && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No parents recorded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Children Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Children</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-1/3">Name</TableHead>
                  <TableHead className="w-1/3">Birth</TableHead>
                  <TableHead className="w-1/3">Death</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {family.children.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No children
                    </TableCell>
                  </TableRow>
                ) : (
                  family.children.map((child, index) => (
                    <TableRow key={child.individual.id}>
                      <TableCell className="align-top">
                        <GenderIcon
                          gender={child.individual.gender}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="align-top font-medium">
                        <Link
                          to="/individuals/$individualId"
                          params={{ individualId: child.individual.id }}
                          className="hover:underline"
                        >
                          {displayName(child.individual.names)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm align-top">
                        {index < showChildBirth.length &&
                        showChildBirth[index] ? (
                          <EventInfo
                            date={birthData.children[index].date}
                            place={birthData.children[index].place}
                          />
                        ) : (
                          <AddIndividualInfo type="birth" />
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm align-top">
                        {index < showChildDeath.length &&
                        showChildDeath[index] ? (
                          <EventInfo
                            date="15 December 2021"
                            place="Halifax, Canada"
                          />
                        ) : (
                          <AddIndividualInfo type="death" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

export default FamilyPage;
