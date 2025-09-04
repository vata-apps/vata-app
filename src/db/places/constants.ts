export const PLACE_SELECT = `
  id,
  gedcomId:gedcom_id,
  name,
  latitude,
  longitude,
  parent:parent_id(id, name),
  type:type_id(id, name, key)
` as const;
