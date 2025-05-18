import { Button } from "@mantine/core";

import { Table } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { AddIndividualInfo } from "../individual/AddIndividualInfo";
import { FamilyMember } from "../individual/FamilyMember";
import EventInfo from "./EventInfo";
import { FamilyWithRelations } from "./types";

const showHusbandBirth = true;
const showHusbandDeath = false;
const showWifeBirth = false;
const showWifeDeath = true;

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

interface FamilyParentsTableProps {
  family: FamilyWithRelations;
}

/**
 * Displays a table of parents of a family
 */
export function FamilyParentsTable({ family }: FamilyParentsTableProps) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th></Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Birth</Table.Th>
          <Table.Th>Death</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {family.husband ? (
          <Table.Tr>
            <Table.Td colSpan={2}>
              <FamilyMember individual={family.husband} />
            </Table.Td>
            <Table.Td>
              {showHusbandBirth ? (
                <EventInfo
                  date={birthData.husband.date}
                  place={birthData.husband.place}
                />
              ) : (
                <AddIndividualInfo type="birth" />
              )}
            </Table.Td>
            <Table.Td>
              {showHusbandDeath ? (
                <EventInfo date="10 January 2020" place="Vancouver, Canada" />
              ) : (
                <AddIndividualInfo type="death" />
              )}
            </Table.Td>
          </Table.Tr>
        ) : (
          <Table.Tr>
            <Table.Td colSpan={2}>
              <Button
                component={Link}
                size="xs"
                to="/individuals"
                variant="transparent"
              >
                Add father
              </Button>
            </Table.Td>
            <Table.Td></Table.Td>
            <Table.Td></Table.Td>
          </Table.Tr>
        )}
        {family.wife ? (
          <Table.Tr>
            <Table.Td colSpan={2}>
              <FamilyMember individual={family.wife} />
            </Table.Td>
            <Table.Td>
              {showWifeBirth ? (
                <EventInfo
                  date={birthData.wife.date}
                  place={birthData.wife.place}
                />
              ) : (
                <AddIndividualInfo type="birth" />
              )}
            </Table.Td>
            <Table.Td>
              {showWifeDeath ? (
                <EventInfo date="5 March 2022" place="Montreal, Canada" />
              ) : (
                <AddIndividualInfo type="death" />
              )}
            </Table.Td>
          </Table.Tr>
        ) : (
          <Table.Tr>
            <Table.Td colSpan={2}>
              <Button
                component={Link}
                size="xs"
                to="/individuals"
                variant="transparent"
              >
                Add mother
              </Button>
            </Table.Td>
            <Table.Td></Table.Td>
            <Table.Td></Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
