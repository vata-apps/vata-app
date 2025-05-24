-- Create a view that flattens family data for efficient sorting and querying
CREATE VIEW family_sorting_view AS
SELECT 
  f.id,
  f.husband_id,
  f.wife_id,
  f.type,
  f.created_at,
  f.gedcom_id,
  -- Husband's primary name fields
  hn.first_name as husband_first_name,
  hn.last_name as husband_last_name,
  -- Wife's primary name fields  
  wn.first_name as wife_first_name,
  wn.last_name as wife_last_name,
  -- Helper fields for searching
  COALESCE(hn.first_name, '') || ' ' || COALESCE(hn.last_name, '') || ' ' ||
  COALESCE(wn.first_name, '') || ' ' || COALESCE(wn.last_name, '') as searchable_names
FROM families f
LEFT JOIN individuals h ON f.husband_id = h.id
LEFT JOIN names hn ON h.id = hn.individual_id AND hn.is_primary = true
LEFT JOIN individuals w ON f.wife_id = w.id  
LEFT JOIN names wn ON w.id = wn.individual_id AND wn.is_primary = true;

-- Add comment to document the view
COMMENT ON VIEW family_sorting_view IS 'Flattened view of families with primary spouse names for efficient sorting and searching';

-- Enable RLS on the view (inherits from underlying tables)
ALTER VIEW family_sorting_view OWNER TO postgres; 
