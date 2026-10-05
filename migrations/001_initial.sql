CREATE TABLE IF NOT EXISTS guestbook_entries (
  id uuid PRIMARY KEY,
  submission_key uuid NOT NULL UNIQUE,
  guest_name varchar(80) NOT NULL,
  attendance text NOT NULL CHECK (attendance IN ('hadir', 'tidak_hadir', 'ragu')),
  guest_count smallint,
  message varchar(500) NOT NULL,
  side text CHECK (side IN ('wanita', 'pria')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guestbook_entries_guest_name_length CHECK (char_length(guest_name) BETWEEN 1 AND 80),
  CONSTRAINT guestbook_entries_message_length CHECK (char_length(message) BETWEEN 1 AND 500),
  CONSTRAINT guestbook_entries_guest_count CHECK (
    (attendance = 'hadir' AND guest_count BETWEEN 1 AND 10)
    OR (attendance <> 'hadir' AND guest_count IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS guestbook_entries_created_id_idx
  ON guestbook_entries (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS submission_limits (
  scope text NOT NULL,
  client_key text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0 CHECK (count >= 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (scope, client_key, window_start)
);

CREATE INDEX IF NOT EXISTS submission_limits_expires_at_idx
  ON submission_limits (expires_at);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
