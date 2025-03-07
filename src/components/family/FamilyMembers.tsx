import EventInfo from "@/components/family/EventInfo";
import { AddIndividualInfo } from "@/components/individual/AddIndividualInfo";
import { FamilyMember } from "@/components/individual/FamilyMember";
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
import { Link } from "@tanstack/react-router";
import { FamilyWithRelations } from "./types";

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

  return (
    <div className="space-y-6">
      {/* Parents Section */}
      <Card>
        <CardHeader>
          <CardTitle>Parents</CardTitle>
        </CardHeader>
        <CardContent>
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
              {family.husband ? (
                <TableRow>
                  <TableCell className="align-top" colSpan={2}>
                    <FamilyMember individual={family.husband} />
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
              ) : (
                <TableRow>
                  <TableCell className="align-top" colSpan={2}>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/individuals"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Add father
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm align-top"></TableCell>
                  <TableCell className="text-muted-foreground text-sm align-top"></TableCell>
                </TableRow>
              )}
              {family.wife ? (
                <TableRow>
                  <TableCell className="align-top" colSpan={2}>
                    <FamilyMember individual={family.wife} />
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
                      <EventInfo date="5 March 2022" place="Montreal, Canada" />
                    ) : (
                      <AddIndividualInfo type="death" />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell className="align-top" colSpan={2}>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/individuals"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Add mother
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm align-top"></TableCell>
                  <TableCell className="text-muted-foreground text-sm align-top"></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Children Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Children</CardTitle>
          <Button variant="secondary" size="sm" asChild>
            <Link to="/individuals">Add Child</Link>
          </Button>
        </CardHeader>
        <CardContent>
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
                    <TableCell className="align-top" colSpan={2}>
                      <FamilyMember individual={child.individual} />
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
        </CardContent>
      </Card>
    </div>
  );
}

export default FamilyMembers;
