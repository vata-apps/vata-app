import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { FileText } from "lucide-react";

export function SourcesCard() {
  return (
    <PageCard title="Sources" icon={FileText} actionLabel="Add sources">
      <BlankState icon={FileText} title="No sources yet" />
    </PageCard>
  );
}
