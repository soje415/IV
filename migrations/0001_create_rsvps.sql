-- The party database. Mirrors PLAN.md §4.
-- SQLite stores booleans as 0/1 and timestamps as ISO-8601 text.

CREATE TABLE rsvps (
  id              TEXT PRIMARY KEY,
  family_name     TEXT    NOT NULL,
  contact         TEXT    NOT NULL,
  attending       INTEGER NOT NULL CHECK (attending IN (0, 1)),
  adults_count    INTEGER NOT NULL DEFAULT 1 CHECK (adults_count >= 0),
  staying         INTEGER NOT NULL DEFAULT 1 CHECK (staying IN (0, 1)),
  emergency_phone TEXT    NOT NULL DEFAULT '',
  team            TEXT             CHECK (team IN ('tabitha', 'abraham') OR team IS NULL),
  wish            TEXT    NOT NULL DEFAULT '',
  photo_consent   INTEGER NOT NULL DEFAULT 0 CHECK (photo_consent IN (0, 1)),
  notes           TEXT    NOT NULL DEFAULT '',
  pass_code       TEXT    NOT NULL UNIQUE,
  arrived_at      TEXT,
  created_at      TEXT    NOT NULL
);

-- The door list is ordered by family name; the pass page looks up by code.
CREATE INDEX idx_rsvps_family_name ON rsvps (family_name);

CREATE TABLE children (
  id        TEXT PRIMARY KEY,
  rsvp_id   TEXT    NOT NULL REFERENCES rsvps (id) ON DELETE CASCADE,
  name      TEXT    NOT NULL,
  age       INTEGER,
  allergies TEXT    NOT NULL DEFAULT '',
  avatar    TEXT    NOT NULL DEFAULT 'star'
);

CREATE INDEX idx_children_rsvp_id ON children (rsvp_id);
