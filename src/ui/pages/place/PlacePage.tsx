import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { fetchPlaceById } from "@/db/places/fetchPlaceById";
import { IconTrash } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { PlaceTabs } from "./PlaceTabs";

export function PlacePage() {
  const { treeId, placeId } = useParams({ from: "/$treeId/places/$placeId" });

  const {
    data: place,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["place", treeId, placeId],
    queryFn: () => fetchPlaceById(treeId, placeId),
    placeholderData: keepPreviousData,
  });

  const handleEdit = () => {
    console.log("edit");
  };

  const handleDelete = () => {
    console.log("delete");
  };

  if (isLoading) return <LoadingState message="Loading place..." />;

  if (error) return <ErrorState error={error} />;
  if (!place) return <ErrorState error={new Error("Place not found")} />;

  return (
    <>
      <PageHeader
        title={place.name}
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

      <PlaceTabs />
    </>
  );
}
