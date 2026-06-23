# GrooveMap Matching Spec

Canonical matching behavior now lives in `specs/contexts/matching.md`. This file remains as a compatibility pointer for older references.

---

`calculate_match(track_a, track_b, context)` returns a 0-100 score, confidence, component scores, and a short explanation.

## Default Weights

- BPM: 25%
- Key: 15%
- Energy: 20%
- Mood: 10%
- Function: 10%
- Groove: 10%
- Spectral: 5%
- History/preference: 5%

## BPM Rules

- diff <= 1: 100
- diff <= 2: 90
- diff <= 4: 75
- diff <= 6: 50
- diff <= 8: 25
- diff > 8: 10

## Key Rules

- Same Camelot: 100
- Adjacent Camelot: 90
- Relative compatible: 85
- Unknown: 50
- Incompatible: 25

## Explanation Rules

Explanations must mention the strongest positive reason and the main risk when present.

Example: `Buen match: BPM muy cercano, energia ligeramente superior, groove rolling similar y tonalidad compatible.`
