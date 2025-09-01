import {
  IconBabyCarriage,
  IconBible,
  IconGrave,
  IconHeartHandshake,
  IconProps,
  IconSkull,
} from "@tabler/icons-react";

interface Props extends IconProps {
  type: string;
}

export function EventIcon({ type, ...props }: Props) {
  if (type === "birth") return <IconBabyCarriage {...props} />;
  if (type === "death") return <IconSkull {...props} />;
  if (type === "marriage") return <IconHeartHandshake {...props} />;
  if (type === "baptism") return <IconBible {...props} />;
  if (type === "burial") return <IconGrave {...props} />;
  return null;
}
