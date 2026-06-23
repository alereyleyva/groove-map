# Set Builder Context Spec

## Purpose

Set Builder owns assisted generation of draft sets from library constraints and DJ intent.

## Current Implementation

- UI form accepts name, duration, BPM range, mood, and energy arc.
- Backend `generate_set_draft` selects compatible analyzed tracks heuristically.
- Draft can be saved as a set.

## Required Inputs

- Duration target.
- BPM range.
- Dominant mood.
- Energy arc.
- Required tracks.
- Excluded tracks.
- Starting track.
- Ending track.
- Wildcard allowance.

## Required Algorithm Behavior

- Select compatible tracks.
- Avoid abrupt BPM jumps.
- Maintain tonal compatibility where possible.
- Respect energy arc.
- Avoid repeating artists too closely.
- Prioritize highly rated tracks.
- Exclude discarded tracks.
- Favor mixability easy/medium.
- Allow explicit wildcards for contrast.

## Gap To Proposal

- Required/excluded/start/end tracks are not exposed in UI.
- Artist spacing is not implemented yet.
- Wildcard logic is not implemented yet.
- Energy arc behavior is shallow.
- Key progression is not enforced.
- Draft explanations are generic.
- No BPM/energy chart in draft result yet.

## Acceptance Criteria

- Generated draft reaches target duration when enough eligible tracks exist.
- Draft explains overall arc and notable risks.
- User can save a draft and receive the same ordered tracks in Sets.
