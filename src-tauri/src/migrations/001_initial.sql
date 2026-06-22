PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  recursive INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_scan_at TEXT
);

CREATE TABLE IF NOT EXISTS tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  year INTEGER,
  duration_seconds REAL,
  sample_rate INTEGER,
  bitrate INTEGER,
  format TEXT,
  file_size INTEGER NOT NULL DEFAULT 0,
  modified_at TEXT,
  artwork_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS track_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track_id INTEGER NOT NULL UNIQUE REFERENCES tracks(id) ON DELETE CASCADE,
  analysis_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  bpm REAL,
  bpm_confidence REAL,
  bpm_source TEXT,
  musical_key TEXT,
  mode TEXT,
  camelot TEXT,
  key_source TEXT,
  loudness REAL,
  peak_level REAL,
  rms REAL,
  dynamic_range REAL,
  energy_score REAL,
  energy_source TEXT,
  danceability_score REAL,
  percussiveness_score REAL,
  brightness_score REAL,
  darkness_score REAL,
  low_end_intensity REAL,
  kick_density REAL,
  spectral_centroid REAL,
  spectral_contrast REAL,
  intro_start REAL,
  intro_end REAL,
  main_start REAL,
  breakdown_start REAL,
  breakdown_end REAL,
  outro_start REAL,
  outro_end REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS track_tags (id INTEGER PRIMARY KEY AUTOINCREMENT, track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE, field TEXT NOT NULL, value TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS track_free_tags (id INTEGER PRIMARY KEY AUTOINCREMENT, track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE, tag TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS track_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, track_id INTEGER NOT NULL UNIQUE REFERENCES tracks(id) ON DELETE CASCADE, note TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS track_ratings (id INTEGER PRIMARY KEY AUTOINCREMENT, track_id INTEGER NOT NULL UNIQUE REFERENCES tracks(id) ON DELETE CASCADE, rating INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS sets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, context TEXT, duration_target_minutes INTEGER, energy_arc TEXT, bpm_min REAL, bpm_max REAL, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS set_tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, set_id INTEGER NOT NULL REFERENCES sets(id) ON DELETE CASCADE, track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE, position INTEGER NOT NULL, locked INTEGER NOT NULL DEFAULT 0, transition_note TEXT, transition_score REAL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(set_id, track_id));

CREATE TABLE IF NOT EXISTS match_scores (id INTEGER PRIMARY KEY AUTOINCREMENT, track_a_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE, track_b_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE, score REAL NOT NULL, confidence REAL NOT NULL, bpm_score REAL, key_score REAL, energy_score REAL, mood_score REAL, function_score REAL, groove_score REAL, spectral_score REAL, history_score REAL, explanation TEXT NOT NULL, analysis_version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(track_a_id, track_b_id, analysis_version));
CREATE TABLE IF NOT EXISTS play_history (id INTEGER PRIMARY KEY AUTOINCREMENT, track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE, set_id INTEGER REFERENCES sets(id) ON DELETE SET NULL, played_at TEXT NOT NULL, context TEXT, notes TEXT);
CREATE TABLE IF NOT EXISTS saved_views (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, filters_json TEXT NOT NULL, sort_json TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
CREATE INDEX IF NOT EXISTS idx_track_analysis_bpm ON track_analysis(bpm);
CREATE INDEX IF NOT EXISTS idx_track_analysis_camelot ON track_analysis(camelot);
CREATE INDEX IF NOT EXISTS idx_track_analysis_status ON track_analysis(status);
CREATE INDEX IF NOT EXISTS idx_track_tags_field_value ON track_tags(field, value);
