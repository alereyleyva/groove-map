# Sets Context Spec

## Purpose

Sets owns set lifecycle, ordered tracks, transition notes, compatibility warnings, usage history, and exports.

## Current Implementation

- User can create sets.
- User can add selected track to first set from detail panel.
- User can remove tracks from a set.
- Set export commands exist for CSV, JSON, and M3U.
- UI copies export content to clipboard.

## Required Behavior

- A set is an ordered list of tracks with metadata: name, description, date, target duration, context, energy arc, BPM range, notes.
- Tracks can be added, removed, reordered via drag and drop, and locked.
- UI displays accumulated duration, BPM progression, energy progression, key progression, warnings, and suggested transitions.
- Transition notes and transition scores are editable.
- Sets can be duplicated.
- Exports: CSV, JSON, M3U, and text tracklist.
- Play history should track usage in sets.

## Gap To Proposal

- No drag-and-drop reorder UI yet.
- Backend reorder exists but UI does not expose it.
- No locked-track UI yet.
- No transition notes UI yet.
- No compatibility warnings in sets yet.
- No BPM/energy/key progression chart yet.
- No duplicate set action yet.
- Text tracklist export is not implemented yet.
- Play history is modeled but not used yet.

## Acceptance Criteria

- User can reorder tracks visually and persist order.
- Export files preserve final order and file paths.
- Warnings identify BPM/key/energy jumps between adjacent tracks.
