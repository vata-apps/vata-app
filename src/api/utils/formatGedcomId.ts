interface Params {
  id: number | null;
  module: "individuals" | "families" | "events" | "places";
}

export function formatGedcomId(params: Params) {
  const { id, module } = params;

  const prefix = (() => {
    if (module === "individuals") return "I";
    if (module === "families") return "F";
    if (module === "events") return "E";
    if (module === "places") return "P";
  })();

  if (!id) return `${prefix}-0000`;

  return `${prefix}-${id.toString().padStart(4, "0")}`;
}
