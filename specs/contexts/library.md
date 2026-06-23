# Library Context Spec

## Purpose

Library owns track exploration, dense table display, search, filters, selection, and track detail access.

## Current Implementation

- Main `Library` view uses TanStack Table.
- Table displays title, artist, BPM, key, energy, mood, function, style, duration, rating, status, and path.
- Search filters title, artist, and filename.
- BPM min/max and analysis status filters are available.
- Selecting a track opens the detail panel and loads top matches.

## Required Behavior

- Table should support large collections without blocking UI.
- Columns required by product: artwork, title, artist, BPM, key, Camelot, energy, mood, function, style, groove, duration, rating, last played, times used, tags, path, analysis status.
- Filters required by product: BPM, key/Camelot, energy, mood, function, style, analysis status, text search.
- Saved views and favorite filters must be persisted locally.
- Bulk actions must support tag edit, reanalysis, add to set, favorite, discarded.

## Gap To Proposal

- No virtualization yet.
- No sorting UI wired beyond base table model.
- Missing key/Camelot, energy, mood, function, style filters.
- Missing saved views.
- Missing bulk selection/actions.
- Missing artwork column.
- Missing last played and times used columns.
- Track match cards currently show target IDs, not full candidate metadata.

## Acceptance Criteria

- 10,000-track libraries remain responsive.
- User can save a filtered view and reload it.
- User can select multiple tracks and apply a structured tag in batch.
