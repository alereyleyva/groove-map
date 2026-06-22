# GrooveMap Testing Spec

## Required Test Areas

- Audio format detection.
- Folder scanner helper behavior.
- SQLite migrations and track insert/update behavior.
- Structured tag updates.
- BPM scoring.
- Camelot/key scoring.
- Total matching score and explanation generation.
- Set draft generation.
- CSV, JSON, and M3U export formatting.

## Verification Commands

- Frontend type/build: `bun run build`
- Rust tests: `cd src-tauri && cargo test`

New behavior should be covered by a failing test first where feasible, then implemented until green.
