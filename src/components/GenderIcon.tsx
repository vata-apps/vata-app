import { Enums } from "@/database.types";
import { MarsIcon, VenusIcon } from "lucide-react";

export function GenderIcon({
  size,
  gender,
}: {
  size?: number;
  gender: Enums<"gender">;
}) {
  if (gender === "female") return <VenusIcon size={size} />;
  return <MarsIcon size={size} />;
}
