# Matching Context Spec

## Purpose

Matching owns compatibility scoring between tracks and explainable recommendations.

## Current Implementation

- Rust `calculate_match(track_a, track_b)` returns total score, confidence, sub-scores, indicator, and explanation.
- BPM scoring follows techno thresholds.
- Camelot same, adjacent, relative, unknown, and incompatible scoring exists.
- Energy, mood, function, groove, and preference heuristics exist.
- `find_matches_for_track` returns top candidates.

## Default Weights

- BPM: 25%.
- Key: 15%.
- Energy: 20%.
- Mood: 10%.
- Function: 10%.
- Groove: 10%.
- Spectral: 5%.
- History/preference: 5%.

## Required Rules

- BPM diff <= 1: 100.
- BPM diff <= 2: 90.
- BPM diff <= 4: 75.
- BPM diff <= 6: 50.
- BPM diff <= 8: 25.
- BPM diff > 8: 10.
- Same Camelot: 100.
- Adjacent Camelot: 90.
- Relative compatible: 85.
- Unknown key: 50.
- Incompatible key: 25.
- Discarded tracks must be excluded from recommendations.
- Matching weights must be adjustable in Settings.
- Explanations must mention strongest positive reason and main risk when present.

## Gap To Proposal

- Context-aware matching is not implemented yet.
- Settings-driven weights are not wired yet.
- Mood-neighbor table is incomplete.
- Groove special cases are minimal.
- Spectral score is placeholder.
- History score does not use transition feedback yet.
- Match results are not cached in `match_scores` yet.
- UI cannot mark transitions good/bad yet.

## Acceptance Criteria

- Top 10 matches exclude discarded tracks.
- Score and confidence are explainable from component scores.
- User can adjust weights and see changed recommendations.
