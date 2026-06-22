# GrooveMap

GrooveMap is a desktop app for DJs focused on local music library analysis, track organization, set building, and smart track matching.

The app scans a local music folder, extracts technical and musical features from tracks, helps classify them with structured tags, and suggests compatible tracks for building coherent DJ sets.

GrooveMap is designed especially for techno DJs, where BPM, energy, groove, mood, key compatibility, and track function are essential for preparing strong sessions.

## Core ideas

GrooveMap helps DJs:

* Explore and organize a local music collection
* Analyze track characteristics such as BPM, key, energy, loudness, groove, and mood
* Add structured tags for style, function, energy, mixability, and personal status
* Create and manage DJ sets from the library
* Find compatible tracks for transitions and set progression
* Understand why two tracks may work well together
* Keep all music and analysis data local

## Privacy-first

GrooveMap is offline-first.
Audio files are not uploaded to any server.
The app works with local folders and stores its database locally.

## Tech stack

GrooveMap is built with:

* Tauri v2
* Rust
* React
* TypeScript
* Vite
* Tailwind CSS
* TanStack Table
* Zustand
* React Hook Form
* Zod
* SQLite via rusqlite
* Symphonia for best-effort metadata/audio probing

## Development

Install dependencies:

```bash
bun install
```

Run the frontend dev server only:

```bash
bun run dev
```

Run the desktop app:

```bash
bun run tauri dev
```

Build the frontend:

```bash
bun run build
```

Run Rust tests:

```bash
cd src-tauri && cargo test
```

Build the desktop bundle:

```bash
bun run tauri build
```

## Local data

GrooveMap stores app data locally in `groove-map.sqlite` under the operating system app data directory for the Tauri app.

The app does not upload audio, metadata, tags, analysis, settings, or set data. Imported audio files are read only and are never modified.

## MVP scope

Implemented foundation:

* Local SQLite schema and migrations
* Local source scanning for MP3, WAV, AIFF, AIF, FLAC, M4A, and OGG
* Metadata extraction best effort through Symphonia
* Track library table with search, BPM filters, status filter, and detail panel
* Structured tags, notes, manual BPM/key override flow
* Analysis queue status
* Set creation, adding tracks, removing tracks, and CSV/JSON/M3U export to clipboard
* Heuristic matching with explainable score components
* Heuristic set draft generation
* Rust tests for scanner helpers, database tags, matching, set draft generation, and exports

## Analysis limitations

The first version intentionally avoids fragile advanced MIR promises. It reads existing metadata and extracts duration/sample-rate where possible. BPM/key/loudness/deep spectral features are nullable and should be manually correctable.

Future advanced analysis can be added behind the Rust analysis boundary, optionally using a sidecar with Essentia or another specialized engine. This must remain local-only.

## Roadmap

* Add robust background analysis queue controls: pause, resume, cancel, retry failed.
* Add deeper audio metrics: RMS, peak, spectral centroid, low-end intensity, kick density.
* Add waveform overview and cue suggestions.
* Add table virtualization for very large libraries.
* Add editable matching weights and function transition matrix.
* Add transition history feedback: good/bad transition markers.
* Add database backup/reset workflows in Settings.
* Add optional local sidecar for advanced MIR.

## Status

This project is in early MVP development.
