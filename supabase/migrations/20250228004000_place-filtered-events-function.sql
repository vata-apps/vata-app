-- Function for events list with search, pagination, and optional place filtering
CREATE OR REPLACE FUNCTION get_events_with_subjects_filtered(
  search_text TEXT DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  sort_field TEXT DEFAULT 'date',
  sort_direction TEXT DEFAULT 'desc',
  place_filter_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  date TEXT,
  description TEXT,
  event_type_name TEXT,
  place_name TEXT,
  subjects TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.date,
    e.description,
    et.name as event_type_name,
    p.name as place_name,
    STRING_AGG(DISTINCT CONCAT(n.first_name, ' ', n.last_name), ', ') as subjects
  FROM events e
  JOIN event_types et ON e.type_id = et.id
  LEFT JOIN places p ON e.place_id = p.id
  JOIN event_subjects es ON e.id = es.event_id
  JOIN individuals i ON es.individual_id = i.id
  JOIN names n ON i.id = n.individual_id AND n.is_primary = true
  WHERE (search_text IS NULL OR
         CONCAT(n.first_name, ' ', n.last_name) ILIKE '%' || search_text || '%' OR
         e.description ILIKE '%' || search_text || '%')
    AND (place_filter_id IS NULL OR e.place_id = place_filter_id)
  GROUP BY e.id, e.date, e.description, et.name, p.name
  ORDER BY
    CASE WHEN sort_field = 'date' AND sort_direction = 'desc' THEN e.date END DESC,
    CASE WHEN sort_field = 'date' AND sort_direction = 'asc' THEN e.date END ASC,
    CASE WHEN sort_field = 'event_type_name' AND sort_direction = 'desc' THEN et.name END DESC,
    CASE WHEN sort_field = 'event_type_name' AND sort_direction = 'asc' THEN et.name END ASC,
    CASE WHEN sort_field = 'place_name' AND sort_direction = 'desc' THEN p.name END DESC,
    CASE WHEN sort_field = 'place_name' AND sort_direction = 'asc' THEN p.name END ASC;
END;
$$ LANGUAGE plpgsql; 
