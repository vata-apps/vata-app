import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { FileText } from "lucide-react";

export function SourcesCard() {
  return (
    <PageCard title="Sources" icon={FileText} actionLabel="Add sources">
      <BlankState
        icon={FileText}
        title="No Sources Yet"
        description="Documents and records that support this event will appear here."
      />
    </PageCard>
  );
}
