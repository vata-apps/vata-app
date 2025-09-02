import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useParams } from "@tanstack/react-router";

export function EventPage() {
  const { eventId, treeId } = useParams({ from: "/$treeId/events/$eventId" });

  const handleDelete = () => {
    console.log("delete");
  };

  const handleEdit = () => {
    console.log("edit");
  };

  return (
    <>
      <PageHeader
        title="Event"
        onBackTo="/$treeId/events"
        onClickEdit={handleEdit}
        menuItems={[
          {
            label: "Delete",
            icon: IconTrash,
            onClick: handleDelete,
            color: "red",
          },
        ]}
      />

      <Stack>
        <p>Tree ID: {treeId}</p>
        <p>Event ID: {eventId}</p>
      </Stack>
    </>
  );
}
