import { CalendarDays, MapPin } from "lucide-react";

/**
 * Renders event information with icons
 */
function EventInfo({ date, place }: { date: string; place: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <CalendarDays className="h-3 w-3" />
        <span>{date}</span>
      </div>
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        <span>{place}</span>
      </div>
    </div>
  );
}

export default EventInfo;
