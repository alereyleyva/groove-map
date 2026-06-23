# MVP Gap Analysis

This document tracks the gap between the original full product proposal and the current MVP implementation.

## Implemented Foundation

- Tauri v2 app with React, TypeScript, Vite, Tailwind CSS.
- Local SQLite persistence via `rusqlite`.
- Canonical migrations.
- Local folder selection.
- Local source scan and track import.
- Supported audio format detection.
- SHA-256 file hashing.
- Symphonia best-effort metadata probing.
- Library UI with table, search, BPM filter, status filter.
- Track detail panel.
- Structured tag add flow.
- Notes.
- Manual BPM/Camelot override.
- Analysis queue status counters.
- Matching algorithm foundation with component scores and explanations.
- Set creation, add/remove track, CSV/JSON/M3U export commands.
- Set Builder draft generation foundation.
- Settings persistence foundation.
- Rust tests for scanner, DB tags, matching, draft generation, exports.

## Largest Product Gaps

- Real background analysis queue controls.
- Advanced audio feature extraction.
- Virtualized large-library table.
- Full structured tagging UX.
- Batch editing.
- Saved library views.
- Set drag-and-drop reorder.
- Transition warnings and charts.
- Transition feedback history.
- Settings-driven matching weights.
- Onboarding first-run flow.
- Source management UI.
- Robust error surfaces for scan/analyze failures.

## Recommended Next Milestones

1. Close Library/Tagging UX gaps: controlled tag forms, rating/free tags, bulk actions, saved views.
2. Close Sets gaps: drag reorder, transition notes, warnings, tracklist export.
3. Close Matching gaps: full candidate metadata in UI, discarded exclusion, editable weights, transition feedback.
4. Close Analysis Queue gaps: persisted queue worker, pause/resume/cancel/retry, failure table.
5. Add advanced analysis metrics incrementally behind nullable schema fields.
