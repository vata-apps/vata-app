import { BlankState } from "@/components/BlankState";
import { PageCard } from "@/components/PageCard";
import { Calendar } from "lucide-react";

/**
 * Displays the family events section
 */
function FamilyEvents() {
  return (
    <PageCard title="Family Events" icon={Calendar} actionLabel="Add event">
      <BlankState icon={Calendar} title="No family events recorded" />
    </PageCard>
  );
}

export default FamilyEvents;
