import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { Camera } from "lucide-react";

export function MediaCard() {
  return (
    <PageCard title="Media" icon={Camera} actionLabel="Add media">
      <BlankState
        icon={Camera}
        title="No Photos or Media"
        description="Photos, documents, and other media related to this event will be displayed here."
      />
    </PageCard>
  );
}
