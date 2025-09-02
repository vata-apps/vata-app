import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useParams } from "@tanstack/react-router";

export function IndividualPage() {
  const { individualId, treeId } = useParams({
    from: "/$treeId/individuals/$individualId",
  });

  const handleEdit = () => {
    console.log("edit");
  };

  const handleDelete = () => {
    console.log("delete");
  };

  return (
    <>
      <PageHeader
        title="Individual"
        onBackTo="/$treeId/individuals"
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
        <p>Individual ID: {individualId}</p>
      </Stack>
    </>
  );
}
