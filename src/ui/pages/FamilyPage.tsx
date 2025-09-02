import { PageHeader } from "@/components/PageHeader";
import { Stack } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useParams } from "@tanstack/react-router";

export function FamilyPage() {
  const { familyId, treeId } = useParams({
    from: "/$treeId/families/$familyId",
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
        title="Family"
        onBackTo="/$treeId/families"
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
        <p>Family ID: {familyId}</p>
      </Stack>
    </>
  );
}
