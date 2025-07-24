import { Enums } from "@/database.types";
import { IconMars, IconVenus } from "@tabler/icons-react";

export function GenderIcon({
  size,
  gender,
}: {
  size?: number;
  gender: Enums<"gender">;
}) {
  if (gender === "female") return <IconVenus size={size} />;
  return <IconMars size={size} />;
}
