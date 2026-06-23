# GrooveMap Product Spec

GrooveMap is a local-first desktop app for techno DJs who manage downloaded music collections and prepare coherent sets.

## MVP Goals

- Select one or more local music folders.
- Scan supported audio files recursively when requested.
- Import technical metadata without modifying original files.
- Persist sources, tracks, analysis state, tags, ratings, notes, sets, and settings locally in SQLite.
- Explore a large library in a dense dark UI.
- Edit structured DJ-specific tags and manual overrides for BPM, key, Camelot, and energy.
- Create ordered sets, add tracks, reorder them, and export CSV, JSON, and M3U.
- Calculate explainable compatibility scores between tracks.
- Suggest at least 10 candidate matches for a selected track when enough library data exists.

## Non-Goals For MVP

- Perfect BPM/key detection.
- Cloud sync.
- Streaming playback platform features.
- Uploading audio to any server.
- Mandatory Python/C++ sidecar.

## UX Principles

- Dark by default.
- Dense but legible.
- Fast table-first workflow.
- Clear filters and keyboard-friendly controls.
- Explain recommendations with musical reasoning.

## Bounded Context Specs

Detailed product behavior is specified by bounded context under `specs/contexts/`. This file only defines the product-level intent and MVP boundary.
