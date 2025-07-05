-- Migration: Complete Database Schema
-- This migration contains all tables, functions, and triggers for the Vata genealogy application
-- All ALTER TABLE statements have been moved into CREATE TABLE statements directly

create type "public"."gender" as enum ('male', 'female');

create type "public"."name_type" as enum ('birth', 'marriage', 'nickname', 'unknown');

create type "public"."family_type" as enum ('married', 'civil union', 'unknown', 'unmarried');

-- Trees table to organize multiple family trees
create table "public"."trees" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "description" text,
    "is_default" boolean not null default false,
    constraint "trees_pkey" PRIMARY KEY (id)
);

alter table "public"."trees" enable row level security;

-- Insert default tree
INSERT INTO "public"."trees" ("name", "description", "is_default") VALUES
('Default Family Tree', 'The main family tree', true);

create table "public"."place_types" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "tree_id" uuid not null,
    constraint "place_types_pkey" PRIMARY KEY (id),
    constraint "place_types_name_tree_key" UNIQUE (name, tree_id),
    constraint "place_types_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE
);

alter table "public"."place_types" enable row level security;

-- NEW UNIFIED EVENT SYSTEM TABLES

-- Event types (unified)
create table "public"."event_types" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "tree_id" uuid not null,
    constraint "event_types_pkey" PRIMARY KEY (id),
    constraint "event_types_name_tree_key" UNIQUE (name, tree_id),
    constraint "event_types_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE
);

alter table "public"."event_types" enable row level security;

-- Event roles
create table "public"."event_roles" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "tree_id" uuid not null,
    constraint "event_roles_pkey" PRIMARY KEY (id),
    constraint "event_roles_name_tree_key" UNIQUE (name, tree_id),
    constraint "event_roles_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE
);

alter table "public"."event_roles" enable row level security;

create table "public"."individuals" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "gender" gender not null,
    "gedcom_id" bigint,
    "tree_id" uuid not null,
    constraint "individuals_pkey" PRIMARY KEY (id),
    constraint "individuals_gedcom_id_tree_key" UNIQUE (gedcom_id, tree_id),
    constraint "individuals_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE
);

alter table "public"."individuals" enable row level security;

create table "public"."names" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "individual_id" uuid not null,
    "first_name" text,
    "last_name" text,
    "surname" text,
    "type" name_type not null default 'birth'::name_type,
    "is_primary" boolean not null default true,
    "tree_id" uuid not null,
    constraint "names_pkey" PRIMARY KEY (id),
    constraint "names_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "names_individual_id_fkey" FOREIGN KEY (individual_id) REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE CASCADE
);

alter table "public"."names" enable row level security;

create table "public"."places" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "type_id" uuid not null,
    "parent_id" uuid,
    "latitude" decimal,
    "longitude" decimal,
    "tree_id" uuid not null,
    "gedcom_id" bigint,
    constraint "places_pkey" PRIMARY KEY (id),
    constraint "places_gedcom_id_tree_key" UNIQUE (gedcom_id, tree_id),
    constraint "places_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "places_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES places(id) ON UPDATE CASCADE ON DELETE SET NULL,
    constraint "places_type_id_fkey" FOREIGN KEY (type_id) REFERENCES place_types(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

alter table "public"."places" enable row level security;

-- Main events table
create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "type_id" uuid not null,
    "date" text,
    "place_id" uuid,
    "description" text,
    "tree_id" uuid not null,
    "gedcom_id" bigint,
    constraint "events_pkey" PRIMARY KEY (id),
    constraint "events_gedcom_id_tree_key" UNIQUE (gedcom_id, tree_id),
    constraint "events_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "events_type_id_fkey" FOREIGN KEY (type_id) REFERENCES event_types(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    constraint "events_place_id_fkey" FOREIGN KEY (place_id) REFERENCES places(id) ON UPDATE CASCADE ON DELETE SET NULL
);

alter table "public"."events" enable row level security;

-- Event subjects (who the event is about)
create table "public"."event_subjects" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "event_id" uuid not null,
    "individual_id" uuid not null,
    "tree_id" uuid not null,
    constraint "event_subjects_pkey" PRIMARY KEY (id),
    constraint "event_subjects_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "event_subjects_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "event_subjects_individual_id_fkey" FOREIGN KEY (individual_id) REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE CASCADE
);

alter table "public"."event_subjects" enable row level security;

-- Event participants (everyone involved with roles)
create table "public"."event_participants" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "event_id" uuid not null,
    "individual_id" uuid not null,
    "role_id" uuid not null,
    "tree_id" uuid not null,
    constraint "event_participants_pkey" PRIMARY KEY (id),
    constraint "event_participants_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "event_participants_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "event_participants_individual_id_fkey" FOREIGN KEY (individual_id) REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "event_participants_role_id_fkey" FOREIGN KEY (role_id) REFERENCES event_roles(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

alter table "public"."event_participants" enable row level security;

create table "public"."families" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "husband_id" uuid,
    "wife_id" uuid,
    "gedcom_id" bigint,
    "type" family_type not null default 'married'::family_type,
    "tree_id" uuid not null,
    constraint "families_pkey" PRIMARY KEY (id),
    constraint "families_gedcom_id_tree_key" UNIQUE (gedcom_id, tree_id),
    constraint "families_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "families_husband_id_fkey" FOREIGN KEY (husband_id) REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE SET NULL,
    constraint "families_wife_id_fkey" FOREIGN KEY (wife_id) REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE SET NULL
);

alter table "public"."families" enable row level security;

create table "public"."family_children" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "family_id" uuid not null,
    "individual_id" uuid not null,
    "tree_id" uuid not null,
    constraint "family_children_pkey" PRIMARY KEY (id),
    constraint "family_children_tree_id_fkey" FOREIGN KEY (tree_id) REFERENCES trees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "family_children_family_id_fkey" FOREIGN KEY (family_id) REFERENCES families(id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint "family_children_individual_id_fkey" FOREIGN KEY (individual_id) REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE CASCADE
);

alter table "public"."family_children" enable row level security;

-- CREATE INDEXES

-- Performance indexes for event queries
CREATE INDEX events_type_id_idx ON public.events USING btree (type_id);
CREATE INDEX events_date_idx ON public.events USING btree (date);
CREATE INDEX events_place_id_idx ON public.events USING btree (place_id);
CREATE INDEX events_tree_id_idx ON public.events USING btree (tree_id);
CREATE INDEX event_subjects_event_id_idx ON public.event_subjects USING btree (event_id);
CREATE INDEX event_subjects_individual_id_idx ON public.event_subjects USING btree (individual_id);
CREATE INDEX event_subjects_tree_id_idx ON public.event_subjects USING btree (tree_id);
CREATE INDEX event_participants_event_id_idx ON public.event_participants USING btree (event_id);
CREATE INDEX event_participants_individual_id_idx ON public.event_participants USING btree (individual_id);
CREATE INDEX event_participants_role_id_idx ON public.event_participants USING btree (role_id);
CREATE INDEX event_participants_tree_id_idx ON public.event_participants USING btree (tree_id);

-- Tree-specific indexes for all tables
CREATE INDEX families_tree_id_idx ON public.families USING btree (tree_id);
CREATE INDEX family_children_tree_id_idx ON public.family_children USING btree (tree_id);
CREATE INDEX individuals_tree_id_idx ON public.individuals USING btree (tree_id);
CREATE INDEX names_tree_id_idx ON public.names USING btree (tree_id);
CREATE INDEX places_tree_id_idx ON public.places USING btree (tree_id);
CREATE INDEX place_types_tree_id_idx ON public.place_types USING btree (tree_id);
CREATE INDEX event_types_tree_id_idx ON public.event_types USING btree (tree_id);
CREATE INDEX event_roles_tree_id_idx ON public.event_roles USING btree (tree_id);

-- GEDCOM ID SYSTEM FUNCTIONS AND TRIGGERS

-- Create a function to get the next gedcom_id for a specific tree and table
CREATE OR REPLACE FUNCTION get_next_gedcom_id(table_name text, tree_id uuid)
RETURNS bigint AS $$
DECLARE
    sequence_name text;
    next_id bigint;
BEGIN
    -- Create sequence name based on table and tree
    sequence_name := table_name || '_gedcom_id_' || tree_id;
    
    -- Create sequence if it doesn't exist
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', sequence_name);
    
    -- Get next value
    EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_id;
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for individuals table
CREATE OR REPLACE FUNCTION set_individual_gedcom_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.gedcom_id IS NULL THEN
        NEW.gedcom_id := get_next_gedcom_id('individuals', NEW.tree_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for families table
CREATE OR REPLACE FUNCTION set_family_gedcom_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.gedcom_id IS NULL THEN
        NEW.gedcom_id := get_next_gedcom_id('families', NEW.tree_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for events table
CREATE OR REPLACE FUNCTION set_event_gedcom_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.gedcom_id IS NULL THEN
        NEW.gedcom_id := get_next_gedcom_id('events', NEW.tree_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for places table
CREATE OR REPLACE FUNCTION set_place_gedcom_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.gedcom_id IS NULL THEN
        NEW.gedcom_id := get_next_gedcom_id('places', NEW.tree_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically populate gedcom_id
CREATE TRIGGER trigger_set_individual_gedcom_id
    BEFORE INSERT ON individuals
    FOR EACH ROW
    EXECUTE FUNCTION set_individual_gedcom_id();

CREATE TRIGGER trigger_set_family_gedcom_id
    BEFORE INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION set_family_gedcom_id();

CREATE TRIGGER trigger_set_event_gedcom_id
    BEFORE INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION set_event_gedcom_id();

CREATE TRIGGER trigger_set_place_gedcom_id
    BEFORE INSERT ON places
    FOR EACH ROW
    EXECUTE FUNCTION set_place_gedcom_id();

-- Function to clean up sequences when a tree is deleted
CREATE OR REPLACE FUNCTION cleanup_tree_sequences()
RETURNS trigger AS $$
DECLARE
    sequence_name text;
BEGIN
    -- Clean up individuals sequences
    sequence_name := 'individuals_gedcom_id_' || OLD.id;
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
    
    -- Clean up families sequences
    sequence_name := 'families_gedcom_id_' || OLD.id;
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
    
    -- Clean up events sequences
    sequence_name := 'events_gedcom_id_' || OLD.id;
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
    
    -- Clean up places sequences
    sequence_name := 'places_gedcom_id_' || OLD.id;
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', sequence_name);
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up sequences when a tree is deleted
CREATE TRIGGER trigger_cleanup_tree_sequences
    AFTER DELETE ON trees
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_tree_sequences();

-- Function to get the current gedcom_id for a tree (useful for debugging)
CREATE OR REPLACE FUNCTION get_current_gedcom_id(table_name text, tree_id uuid)
RETURNS bigint AS $$
DECLARE
    sequence_name text;
    current_id bigint;
BEGIN
    sequence_name := table_name || '_gedcom_id_' || tree_id;
    
    -- Check if sequence exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_sequences 
        WHERE schemaname = 'public' 
        AND sequencename = sequence_name
    ) THEN
        RETURN 0;
    END IF;
    
    -- Get current value
    EXECUTE format('SELECT last_value FROM %I', sequence_name) INTO current_id;
    
    RETURN current_id;
END;
$$ LANGUAGE plpgsql;

-- EVENT RPC FUNCTIONS

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

-- Function for events list with search, pagination, and optional place/family filtering
CREATE OR REPLACE FUNCTION get_events_with_subjects_filtered(
  search_text TEXT DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  sort_field TEXT DEFAULT 'date',
  sort_direction TEXT DEFAULT 'desc',
  place_filter_id UUID DEFAULT NULL,
  family_filter_id UUID DEFAULT NULL
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
    AND (family_filter_id IS NULL OR 
         (
           -- Include family events (marriage, divorce, etc.) where spouses are subjects
           (et.name IN ('marriage', 'divorce', 'engagement', 'annulment', 'separation') AND
            i.id IN (
              SELECT f.husband_id FROM families f WHERE f.id = family_filter_id AND f.husband_id IS NOT NULL
              UNION
              SELECT f.wife_id FROM families f WHERE f.id = family_filter_id AND f.wife_id IS NOT NULL
            ))
           OR
           -- Include birth events of children
           (et.name = 'birth' AND
            i.id IN (
              SELECT fc.individual_id FROM family_children fc WHERE fc.family_id = family_filter_id
            ))
           OR
           -- Include death events of all family members (spouses and children)
           (et.name = 'death' AND
            i.id IN (
              SELECT f.husband_id FROM families f WHERE f.id = family_filter_id AND f.husband_id IS NOT NULL
              UNION
              SELECT f.wife_id FROM families f WHERE f.id = family_filter_id AND f.wife_id IS NOT NULL
              UNION
              SELECT fc.individual_id FROM family_children fc WHERE fc.family_id = family_filter_id
            ))
         ))
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

-- GRANT PERMISSIONS

grant delete on table "public"."trees" to "anon";
grant insert on table "public"."trees" to "anon";
grant references on table "public"."trees" to "anon";
grant select on table "public"."trees" to "anon";
grant trigger on table "public"."trees" to "anon";
grant truncate on table "public"."trees" to "anon";
grant update on table "public"."trees" to "anon";
grant delete on table "public"."trees" to "authenticated";
grant insert on table "public"."trees" to "authenticated";
grant references on table "public"."trees" to "authenticated";
grant select on table "public"."trees" to "authenticated";
grant trigger on table "public"."trees" to "authenticated";
grant truncate on table "public"."trees" to "authenticated";
grant update on table "public"."trees" to "authenticated";
grant delete on table "public"."trees" to "service_role";
grant insert on table "public"."trees" to "service_role";
grant references on table "public"."trees" to "service_role";
grant select on table "public"."trees" to "service_role";
grant trigger on table "public"."trees" to "service_role";
grant truncate on table "public"."trees" to "service_role";
grant update on table "public"."trees" to "service_role";

grant delete on table "public"."families" to "anon";
grant insert on table "public"."families" to "anon";
grant references on table "public"."families" to "anon";
grant select on table "public"."families" to "anon";
grant trigger on table "public"."families" to "anon";
grant truncate on table "public"."families" to "anon";
grant update on table "public"."families" to "anon";
grant delete on table "public"."families" to "authenticated";
grant insert on table "public"."families" to "authenticated";
grant references on table "public"."families" to "authenticated";
grant select on table "public"."families" to "authenticated";
grant trigger on table "public"."families" to "authenticated";
grant truncate on table "public"."families" to "authenticated";
grant update on table "public"."families" to "authenticated";
grant delete on table "public"."families" to "service_role";
grant insert on table "public"."families" to "service_role";
grant references on table "public"."families" to "service_role";
grant select on table "public"."families" to "service_role";
grant trigger on table "public"."families" to "service_role";
grant truncate on table "public"."families" to "service_role";
grant update on table "public"."families" to "service_role";

grant delete on table "public"."family_children" to "anon";
grant insert on table "public"."family_children" to "anon";
grant references on table "public"."family_children" to "anon";
grant select on table "public"."family_children" to "anon";
grant trigger on table "public"."family_children" to "anon";
grant truncate on table "public"."family_children" to "anon";
grant update on table "public"."family_children" to "anon";
grant delete on table "public"."family_children" to "authenticated";
grant insert on table "public"."family_children" to "authenticated";
grant references on table "public"."family_children" to "authenticated";
grant select on table "public"."family_children" to "authenticated";
grant trigger on table "public"."family_children" to "authenticated";
grant truncate on table "public"."family_children" to "authenticated";
grant update on table "public"."family_children" to "authenticated";
grant delete on table "public"."family_children" to "service_role";
grant insert on table "public"."family_children" to "service_role";
grant references on table "public"."family_children" to "service_role";
grant select on table "public"."family_children" to "service_role";
grant trigger on table "public"."family_children" to "service_role";
grant truncate on table "public"."family_children" to "service_role";
grant update on table "public"."family_children" to "service_role";

grant delete on table "public"."individuals" to "anon";
grant insert on table "public"."individuals" to "anon";
grant references on table "public"."individuals" to "anon";
grant select on table "public"."individuals" to "anon";
grant trigger on table "public"."individuals" to "anon";
grant truncate on table "public"."individuals" to "anon";
grant update on table "public"."individuals" to "anon";
grant delete on table "public"."individuals" to "authenticated";
grant insert on table "public"."individuals" to "authenticated";
grant references on table "public"."individuals" to "authenticated";
grant select on table "public"."individuals" to "authenticated";
grant trigger on table "public"."individuals" to "authenticated";
grant truncate on table "public"."individuals" to "authenticated";
grant update on table "public"."individuals" to "authenticated";
grant delete on table "public"."individuals" to "service_role";
grant insert on table "public"."individuals" to "service_role";
grant references on table "public"."individuals" to "service_role";
grant select on table "public"."individuals" to "service_role";
grant trigger on table "public"."individuals" to "service_role";
grant truncate on table "public"."individuals" to "service_role";
grant update on table "public"."individuals" to "service_role";

grant delete on table "public"."names" to "anon";
grant insert on table "public"."names" to "anon";
grant references on table "public"."names" to "anon";
grant select on table "public"."names" to "anon";
grant trigger on table "public"."names" to "anon";
grant truncate on table "public"."names" to "anon";
grant update on table "public"."names" to "anon";
grant delete on table "public"."names" to "authenticated";
grant insert on table "public"."names" to "authenticated";
grant references on table "public"."names" to "authenticated";
grant select on table "public"."names" to "authenticated";
grant trigger on table "public"."names" to "authenticated";
grant truncate on table "public"."names" to "authenticated";
grant update on table "public"."names" to "authenticated";
grant delete on table "public"."names" to "service_role";
grant insert on table "public"."names" to "service_role";
grant references on table "public"."names" to "service_role";
grant select on table "public"."names" to "service_role";
grant trigger on table "public"."names" to "service_role";
grant truncate on table "public"."names" to "service_role";
grant update on table "public"."names" to "service_role";

grant delete on table "public"."places" to "anon";
grant insert on table "public"."places" to "anon";
grant references on table "public"."places" to "anon";
grant select on table "public"."places" to "anon";
grant trigger on table "public"."places" to "anon";
grant truncate on table "public"."places" to "anon";
grant update on table "public"."places" to "anon";
grant delete on table "public"."places" to "authenticated";
grant insert on table "public"."places" to "authenticated";
grant references on table "public"."places" to "authenticated";
grant select on table "public"."places" to "authenticated";
grant trigger on table "public"."places" to "authenticated";
grant truncate on table "public"."places" to "authenticated";
grant update on table "public"."places" to "authenticated";
grant delete on table "public"."places" to "service_role";
grant insert on table "public"."places" to "service_role";
grant references on table "public"."places" to "service_role";
grant select on table "public"."places" to "service_role";
grant trigger on table "public"."places" to "service_role";
grant truncate on table "public"."places" to "service_role";
grant update on table "public"."places" to "service_role";

grant delete on table "public"."place_types" to "anon";
grant insert on table "public"."place_types" to "anon";
grant references on table "public"."place_types" to "anon";
grant select on table "public"."place_types" to "anon";
grant trigger on table "public"."place_types" to "anon";
grant truncate on table "public"."place_types" to "anon";
grant update on table "public"."place_types" to "anon";
grant delete on table "public"."place_types" to "authenticated";
grant insert on table "public"."place_types" to "authenticated";
grant references on table "public"."place_types" to "authenticated";
grant select on table "public"."place_types" to "authenticated";
grant trigger on table "public"."place_types" to "authenticated";
grant truncate on table "public"."place_types" to "authenticated";
grant update on table "public"."place_types" to "authenticated";
grant delete on table "public"."place_types" to "service_role";
grant insert on table "public"."place_types" to "service_role";
grant references on table "public"."place_types" to "service_role";
grant select on table "public"."place_types" to "service_role";
grant trigger on table "public"."place_types" to "service_role";
grant truncate on table "public"."place_types" to "service_role";
grant update on table "public"."place_types" to "service_role";

-- NEW EVENT SYSTEM GRANTS

grant delete on table "public"."event_types" to "anon";
grant insert on table "public"."event_types" to "anon";
grant references on table "public"."event_types" to "anon";
grant select on table "public"."event_types" to "anon";
grant trigger on table "public"."event_types" to "anon";
grant truncate on table "public"."event_types" to "anon";
grant update on table "public"."event_types" to "anon";
grant delete on table "public"."event_types" to "authenticated";
grant insert on table "public"."event_types" to "authenticated";
grant references on table "public"."event_types" to "authenticated";
grant select on table "public"."event_types" to "authenticated";
grant trigger on table "public"."event_types" to "authenticated";
grant truncate on table "public"."event_types" to "authenticated";
grant update on table "public"."event_types" to "authenticated";
grant delete on table "public"."event_types" to "service_role";
grant insert on table "public"."event_types" to "service_role";
grant references on table "public"."event_types" to "service_role";
grant select on table "public"."event_types" to "service_role";
grant trigger on table "public"."event_types" to "service_role";
grant truncate on table "public"."event_types" to "service_role";
grant update on table "public"."event_types" to "service_role";

grant delete on table "public"."event_roles" to "anon";
grant insert on table "public"."event_roles" to "anon";
grant references on table "public"."event_roles" to "anon";
grant select on table "public"."event_roles" to "anon";
grant trigger on table "public"."event_roles" to "anon";
grant truncate on table "public"."event_roles" to "anon";
grant update on table "public"."event_roles" to "anon";
grant delete on table "public"."event_roles" to "authenticated";
grant insert on table "public"."event_roles" to "authenticated";
grant references on table "public"."event_roles" to "authenticated";
grant select on table "public"."event_roles" to "authenticated";
grant trigger on table "public"."event_roles" to "authenticated";
grant truncate on table "public"."event_roles" to "authenticated";
grant update on table "public"."event_roles" to "authenticated";
grant delete on table "public"."event_roles" to "service_role";
grant insert on table "public"."event_roles" to "service_role";
grant references on table "public"."event_roles" to "service_role";
grant select on table "public"."event_roles" to "service_role";
grant trigger on table "public"."event_roles" to "service_role";
grant truncate on table "public"."event_roles" to "service_role";
grant update on table "public"."event_roles" to "service_role";

grant delete on table "public"."events" to "anon";
grant insert on table "public"."events" to "anon";
grant references on table "public"."events" to "anon";
grant select on table "public"."events" to "anon";
grant trigger on table "public"."events" to "anon";
grant truncate on table "public"."events" to "anon";
grant update on table "public"."events" to "anon";
grant delete on table "public"."events" to "authenticated";
grant insert on table "public"."events" to "authenticated";
grant references on table "public"."events" to "authenticated";
grant select on table "public"."events" to "authenticated";
grant trigger on table "public"."events" to "authenticated";
grant truncate on table "public"."events" to "authenticated";
grant update on table "public"."events" to "authenticated";
grant delete on table "public"."events" to "service_role";
grant insert on table "public"."events" to "service_role";
grant references on table "public"."events" to "service_role";
grant select on table "public"."events" to "service_role";
grant trigger on table "public"."events" to "service_role";
grant truncate on table "public"."events" to "service_role";
grant update on table "public"."events" to "service_role";

grant delete on table "public"."event_subjects" to "anon";
grant insert on table "public"."event_subjects" to "anon";
grant references on table "public"."event_subjects" to "anon";
grant select on table "public"."event_subjects" to "anon";
grant trigger on table "public"."event_subjects" to "anon";
grant truncate on table "public"."event_subjects" to "anon";
grant update on table "public"."event_subjects" to "anon";
grant delete on table "public"."event_subjects" to "authenticated";
grant insert on table "public"."event_subjects" to "authenticated";
grant references on table "public"."event_subjects" to "authenticated";
grant select on table "public"."event_subjects" to "authenticated";
grant trigger on table "public"."event_subjects" to "authenticated";
grant truncate on table "public"."event_subjects" to "authenticated";
grant update on table "public"."event_subjects" to "authenticated";
grant delete on table "public"."event_subjects" to "service_role";
grant insert on table "public"."event_subjects" to "service_role";
grant references on table "public"."event_subjects" to "service_role";
grant select on table "public"."event_subjects" to "service_role";
grant trigger on table "public"."event_subjects" to "service_role";
grant truncate on table "public"."event_subjects" to "service_role";
grant update on table "public"."event_subjects" to "service_role";

grant delete on table "public"."event_participants" to "anon";
grant insert on table "public"."event_participants" to "anon";
grant references on table "public"."event_participants" to "anon";
grant select on table "public"."event_participants" to "anon";
grant trigger on table "public"."event_participants" to "anon";
grant truncate on table "public"."event_participants" to "anon";
grant update on table "public"."event_participants" to "anon";
grant delete on table "public"."event_participants" to "authenticated";
grant insert on table "public"."event_participants" to "authenticated";
grant references on table "public"."event_participants" to "authenticated";
grant select on table "public"."event_participants" to "authenticated";
grant trigger on table "public"."event_participants" to "authenticated";
grant truncate on table "public"."event_participants" to "authenticated";
grant update on table "public"."event_participants" to "authenticated";
grant delete on table "public"."event_participants" to "service_role";
grant insert on table "public"."event_participants" to "service_role";
grant references on table "public"."event_participants" to "service_role";
grant select on table "public"."event_participants" to "service_role";
grant trigger on table "public"."event_participants" to "service_role";
grant truncate on table "public"."event_participants" to "service_role";
grant update on table "public"."event_participants" to "service_role";

-- ROW LEVEL SECURITY POLICIES

create policy "Enable read access for all users"
on "public"."trees"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."families"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."individuals"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."names"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."family_children"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."places"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."place_types"
as permissive
for select
to public
using (true);

-- NEW EVENT SYSTEM POLICIES

create policy "Enable read access for all users"
on "public"."event_types"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."event_roles"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."events"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."event_subjects"
as permissive
for select
to public
using (true);

create policy "Enable read access for all users"
on "public"."event_participants"
as permissive
for select
to public
using (true);

-- Grant necessary permissions for GEDCOM functions
GRANT EXECUTE ON FUNCTION get_next_gedcom_id(text, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_individual_gedcom_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_family_gedcom_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_event_gedcom_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_place_gedcom_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_tree_sequences() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_current_gedcom_id(text, uuid) TO anon, authenticated, service_role; 
