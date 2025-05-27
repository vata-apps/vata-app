import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { Map } from "lucide-react";

export function MapCard() {
  return (
    <PageCard title="Map" icon={Map}>
      <BlankState icon={Map} title="Map view coming soon" />
    </PageCard>
  );
}
