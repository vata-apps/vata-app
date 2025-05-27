import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { Map } from "lucide-react";

export function MapCard() {
  return (
    <PageCard title="Map" icon={Map}>
      <BlankState
        icon={Map}
        title="Map View Coming Soon"
        description="Interactive map showing the location of this place will be displayed here."
      />
    </PageCard>
  );
}
