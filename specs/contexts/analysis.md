# Analysis Context Spec

## Purpose

Analysis owns background analysis state, extraction/calculation of audio features, confidence, and safe nullable handling for unavailable metrics.

## Current Implementation

- `track_analysis` table stores queue status and many nullable metrics.
- Imported tracks start with `pending` analysis status.
- Existing metadata BPM/key can be stored when detected.
- Manual override command marks analysis as `done`.
- Analysis Queue UI displays status counts.

## Required Metrics

- Duration.
- Estimated BPM and BPM confidence.
- Key, mode, and Camelot.
- Loudness/RMS, peak level, dynamic range.
- Energy, danceability/groove, percussiveness, brightness, darkness.
- Low-end intensity, kick density.
- Spectral centroid and spectral contrast.
- Intro/outro/breakdown/main section estimates.
- Cue suggestions: useful start, first drop, main breakdown, mixable outro.

## Gap To Proposal

- No true background worker queue yet.
- No pause/resume/cancel/retry UI behavior yet.
- No batch analyzer implementation beyond manual updates.
- No RMS, peak, loudness, spectral, kick density, or section detection yet.
- No waveform generation yet.
- No analysis error detail UI yet.

## Acceptance Criteria

- Analysis can run without blocking the Tauri main thread.
- Queue state persists across app restarts.
- Unsupported metrics display as unavailable, not zero.
- User can correct failed BPM/key/energy manually.
