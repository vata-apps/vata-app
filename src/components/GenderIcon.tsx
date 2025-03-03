import { MarsIcon, VenusIcon } from "lucide-react";

export function GenderIcon({
  className,
  gender,
}: {
  className?: string;
  gender: "male" | "female";
}) {
  if (gender === "female") return <VenusIcon className={className} />;
  return <MarsIcon className={className} />;
}
