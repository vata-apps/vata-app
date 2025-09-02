import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useParams } from "@tanstack/react-router";

export function PlacePage() {
  const { placeId, treeId } = useParams({ from: "/$treeId/places/$placeId" });

  const handleEdit = () => {
    console.log("edit");
  };

  const handleDelete = () => {
    console.log("delete");
  };

  return (
    <>
      <PageHeader
        title="Place"
        onBackTo="/$treeId/places"
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
        <p>Place ID: {placeId}</p>
      </Stack>
    </>
  );
}
