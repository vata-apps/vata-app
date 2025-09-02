export function formatGedcomId(
  module: "individuals" | "families" | "events" | "places",
  id: number,
) {
  const prefix = (() => {
    if (module === "individuals") return "I";
    if (module === "families") return "F";
    if (module === "events") return "E";
    if (module === "places") return "P";
    return "";
  })();

  return `${prefix}-${id.toString().padStart(4, "0")}`;
}
