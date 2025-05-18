import { Table } from "@mantine/core";
import { AddIndividualInfo } from "../individual/AddIndividualInfo";
import { FamilyMember } from "../individual/FamilyMember";
import EventInfo from "./EventInfo";
import { FamilyWithRelations } from "./types";

// For demonstration, we'll show data for some members and buttons for others
const showChildBirth = [true, false];
const showChildDeath = [false, false];

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

interface FamilyChildrenTableProps {
  family: FamilyWithRelations;
}

/**
 * Displays a table of children of a family
 */
export function FamilyChildrenTable({ family }: FamilyChildrenTableProps) {
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
        {family.children.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={4}>No children</Table.Td>
          </Table.Tr>
        ) : (
          family.children.map((child, index) => (
            <Table.Tr key={child.individual.id}>
              <Table.Td colSpan={2}>
                <FamilyMember individual={child.individual} />
              </Table.Td>
              <Table.Td>
                {index < showChildBirth.length && showChildBirth[index] ? (
                  <EventInfo
                    date={birthData.children[index].date}
                    place={birthData.children[index].place}
                  />
                ) : (
                  <AddIndividualInfo type="birth" />
                )}
              </Table.Td>
              <Table.Td>
                {index < showChildDeath.length && showChildDeath[index] ? (
                  <EventInfo date="15 December 2021" place="Halifax, Canada" />
                ) : (
                  <AddIndividualInfo type="death" />
                )}
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  );
}
