# GrooveMap Specs

Specs are canonical. Implementation must stay synchronized with these documents.

Behavior specs use Gherkin (`Feature`, `Scenario`, `Given`, `When`, `Then`). The data model uses DBML.

## Bounded Contexts

- `contexts/ingestion.md`: local source selection, scanning, hashing, metadata import.
- `contexts/library.md`: library exploration, filters, table, track detail.
- `contexts/tagging.md`: structured tags, free tags, notes, ratings, manual overrides.
- `contexts/analysis.md`: analysis queue, audio metrics, confidence, nullable unavailable metrics.
- `contexts/matching.md`: pair compatibility, scoring, explanations, settings-driven weights.
- `contexts/sets.md`: set lifecycle, ordered tracks, transitions, exports.
- `contexts/set-builder.md`: heuristic assisted set draft generation.
- `contexts/settings-privacy.md`: local settings, filesystem permissions, privacy guarantees.

## Cross-Cutting Specs

- `architecture.md`: architecture and dependency rules.
- `data-model.dbml`: canonical SQLite model in DBML.
- `testing.md`: required verification and TDD expectations.
- `gap-analysis.md`: known gap between the original product proposal and current MVP.
