# Settings And Privacy Context Spec

## Purpose

Settings and Privacy owns local app preferences, matching weights, analysis defaults, filesystem permissions, database safety, and privacy guarantees.

## Current Implementation

- Settings can store arbitrary key/value JSON locally in `app_settings`.
- UI exposes theme, default BPM range, and analysis concurrency placeholders.
- Tauri dialog/fs capabilities are enabled.
- App data is local SQLite.

## Required Settings

- Theme: dark, light, system.
- Default BPM range.
- Default set duration.
- Default analysis concurrency.
- Matching weights.
- Excluded folders.
- Allowed audio formats.
- Manual override priority.
- Backup database.
- Reset database.

## Privacy Rules

- No audio upload.
- No metadata upload.
- No analysis upload.
- No settings upload.
- Do not mutate original audio files.
- Request minimum filesystem permissions.
- Removing a source must never delete files.

## Gap To Proposal

- Matching weights UI is not implemented yet.
- Excluded folders UI is not implemented yet.
- Allowed formats UI is not implemented yet.
- Backup/reset DB workflows are not implemented yet.
- Theme value is stored but not applied yet.

## Acceptance Criteria

- Settings persist across restart.
- Privacy guarantees are visible in onboarding/settings.
- Reset database requires explicit confirmation.
