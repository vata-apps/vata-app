-- Function for events list with search and pagination
CREATE OR REPLACE FUNCTION get_events_with_subjects(
  search_text TEXT DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  sort_field TEXT DEFAULT 'date',
  sort_direction TEXT DEFAULT 'desc'
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

-- Function for event details with all participants
CREATE OR REPLACE FUNCTION get_event_participants(event_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', e.id,
    'date', e.date,
    'description', e.description,
    'place_id', e.place_id,
    'event_type', json_build_object(
      'id', et.id,
      'name', et.name
    ),
    'place', CASE WHEN p.id IS NOT NULL THEN json_build_object(
      'id', p.id,
      'name', p.name
    ) ELSE NULL END,
    'participants', (
      SELECT json_agg(
        json_build_object(
          'id', ep.id,
          'individual_id', ep.individual_id,
          'role_name', er.name,
          'is_subject', CASE WHEN es.individual_id IS NOT NULL THEN true ELSE false END,
          'individual', json_build_object(
            'id', i.id,
            'gender', i.gender,
            'names', (
              SELECT json_agg(
                json_build_object(
                  'first_name', n.first_name,
                  'last_name', n.last_name,
                  'is_primary', n.is_primary
                )
              )
              FROM names n WHERE n.individual_id = i.id
            )
          )
        )
      )
      FROM event_participants ep
      JOIN individuals i ON ep.individual_id = i.id
      JOIN event_roles er ON ep.role_id = er.id
      LEFT JOIN event_subjects es ON ep.event_id = es.event_id AND ep.individual_id = es.individual_id
      WHERE ep.event_id = e.id
    )
  ) INTO result
  FROM events e
  JOIN event_types et ON e.type_id = et.id
  LEFT JOIN places p ON e.place_id = p.id
  WHERE e.id = event_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql; 
