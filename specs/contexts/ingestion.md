# Ingestion Context Spec

## Purpose

Ingestion owns selecting local music folders, scanning supported files, importing file identity and metadata, and preserving source state locally.

## Current Implementation

- Tauri command `select_music_folder` opens a folder picker.
- Tauri command `add_source` persists a local source.
- Tauri command `scan_source` scans a source path.
- Supported formats: `mp3`, `wav`, `aiff`, `aif`, `flac`, `m4a`, `ogg`.
- Scanner uses `walkdir` and respects source recursive mode.
- File hash uses SHA-256.
- Metadata probing uses Symphonia best effort.
- Original audio files are never modified.

## Required Behavior

- Import absolute path, file name, hash, size, modified time, format, and available metadata.
- Detect duplicates by file path and hash where possible.
- A disconnected or unreadable folder must produce a clear error.
- Removing a source must not delete files from disk.

## Gap To Proposal

- No multi-source management UI yet.
- No source removal UI yet.
- No duplicate resolution UI yet.
- No incremental rescan diff for moved/deleted files yet.
- No explicit per-file scan error table yet.

## Acceptance Criteria

- User can pick a local folder and import tracks without audio mutation.
- Re-scanning the same folder does not duplicate existing file paths.
- Scanner helper tests cover allowed formats.
