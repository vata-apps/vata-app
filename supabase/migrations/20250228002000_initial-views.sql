 

-- Create event details view for the new unified event system
CREATE VIEW event_details AS
SELECT
  e.*,
  et.name as event_type_name,
  p.name as place_name,
  -- Subjects as JSON array
  (
    SELECT json_agg(
      json_build_object(
        'id', i.id,
        'name', CONCAT(n.first_name, ' ', n.last_name)
      )
    )
    FROM event_subjects es
    JOIN individuals i ON es.individual_id = i.id
    JOIN names n ON i.id = n.individual_id AND n.is_primary = true
    WHERE es.event_id = e.id
  ) as subjects
FROM events e
JOIN event_types et ON e.type_id = et.id
LEFT JOIN places p ON e.place_id = p.id;

-- Add comment to document the view
COMMENT ON VIEW event_details IS 'Unified view of events with type, place, and subject information for efficient querying';

-- Enable RLS on the view (inherits from underlying tables)
ALTER VIEW event_details OWNER TO postgres; 
