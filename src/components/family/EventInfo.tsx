import { Group } from "@mantine/core";
import { CalendarDays, MapPin } from "lucide-react";

/**
 * Renders event information with icons
 */
function EventInfo({ date, place }: { date: string; place: string }) {
  return (
    <Group gap="xs">
      <CalendarDays size={12} />
      <span>{date}</span>
      <MapPin size={12} />
      <span>{place}</span>
    </Group>
  );
}

export default EventInfo;
