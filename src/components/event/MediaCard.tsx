import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { Camera } from "lucide-react";

export function MediaCard() {
  return (
    <PageCard title="Media" icon={Camera} actionLabel="Add media">
      <BlankState icon={Camera} title="No media yet" />
    </PageCard>
  );
}
