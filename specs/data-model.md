# GrooveMap Data Model Spec

The local SQLite database is named `groove-map.sqlite`.

## Tables

- `sources`: imported folders.
- `tracks`: file identity and metadata.
- `track_analysis`: analysis queue state and musical features.
- `track_tags`: structured field/value tags.
- `track_free_tags`: freeform tags.
- `track_notes`: personal notes.
- `track_ratings`: personal ratings.
- `sets`: set metadata.
- `set_tracks`: ordered set tracks and transition notes.
- `match_scores`: cached compatibility results.
- `play_history`: historical usage.
- `saved_views`: saved library filters.
- `app_settings`: local settings.

## Manual Override Sources

- `bpm_source`: `metadata`, `analysis`, or `manual`.
- `key_source`: `metadata`, `analysis`, or `manual`.
- `energy_source`: `analysis` or `manual`.

Manual values must take precedence over automatic values in UI and matching.
