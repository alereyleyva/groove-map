# AGENTS.md

## Project Overview

GrooveMap is an offline-first Tauri v2 desktop app for techno DJs. It scans local music folders, stores metadata and analysis locally in SQLite, helps classify tracks with structured tags, builds DJ sets, and suggests compatible track matches with explainable heuristics.

The app must never upload audio, metadata, analysis, or user configuration to any server. All state lives locally.

## Mandatory Workflow

- Always apply SDD: specs are canonical and implementation must stay synchronized with `specs/`.
- Behavior specs must be written in Gherkin format: `Feature`, `Scenario`, `Given`, `When`, `Then`.
- The canonical data model must be written in DBML at `specs/data-model.dbml`.
- The canonical visual identity must be maintained in `DESIGN.md` using the official Google `design.md` spec: YAML front matter tokens plus ordered Markdown sections.
- Always use TDD: write or update tests before production behavior changes where feasible, then make tests pass.
- Keep code Clean Code and SOLID: small cohesive modules, explicit boundaries, dependency direction inward.
- Use Clean Architecture for both frontend and Rust backend.
- Make atomic, functional, semantic commits. Do not batch unrelated changes into a single commit.
- Before changing Tauri code, load/read the installed `tauri-v2` skill from `.agents/skills/tauri-v2/SKILL.md`.
- Before writing, reviewing, or refactoring Rust code, load/read and strictly follow the installed `rust-best-practices` skill from `.agents/skills/rust-best-practices/SKILL.md`.
- Register every Tauri command in `tauri::generate_handler![]`.
- Keep `src-tauri/src/main.rs` thin; app logic belongs in `src-tauri/src/lib.rs` and modules.
- Use owned types in async Tauri commands, never borrowed command parameters.
- Do not block the Tauri main thread with long-running work.

## Canonical Specs

- Specs index: `specs/README.md`
- Product spec: `specs/product.md`
- Architecture spec: `specs/architecture.md`
- Data model spec: `specs/data-model.dbml`
- Design spec: `DESIGN.md`
- Testing spec: `specs/testing.md`
- Gap analysis: `specs/gap-analysis.md`
- Bounded context specs live under `specs/contexts/` and are the primary source for feature behavior:
- Ingestion: `specs/contexts/ingestion.md`
- Library: `specs/contexts/library.md`
- Tagging: `specs/contexts/tagging.md`
- Analysis: `specs/contexts/analysis.md`
- Matching: `specs/contexts/matching.md`
- Sets: `specs/contexts/sets.md`
- Set Builder: `specs/contexts/set-builder.md`
- Settings and Privacy: `specs/contexts/settings-privacy.md`

When behavior changes, update the relevant bounded context spec in the same atomic change or before the implementation commit. If a task closes or creates a known product gap, update `specs/gap-analysis.md` as well.

When visual design, layout, component styling, or UI interaction patterns change, update `DESIGN.md` in the same atomic change. `DESIGN.md` must remain valid according to the Google `design.md` specification and must pass `npx @google/design.md lint DESIGN.md` with zero errors before finalizing UI work.

## Setup Commands

- Install frontend dependencies: `bun install`
- Start web dev server only: `bun run dev`
- Start Tauri app: `bun run tauri dev`
- Build frontend: `bun run build`
- Build Tauri app: `bun run tauri build`
- Run Rust tests: `cd src-tauri && cargo test`
- Validate design spec: `npx @google/design.md lint DESIGN.md`

## Development Workflow

- Package manager: Bun.
- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Desktop/backend: Tauri v2, Rust, SQLite via `rusqlite`.
- Local database name: `groove-map.sqlite`.
- Visible product name: `GrooveMap`.
- Binary/project name: `groove-map`.
- Bundle identifier: `com.groovemap.desktop`.

## Architecture Rules

### Frontend

- Treat `DESIGN.md` as the source of truth for visual identity, component tone, interaction rules, colors, spacing, shapes, and layout direction.
- Organize by features under `src/features/`.
- Keep reusable primitives under `src/components/`.
- Keep IPC wrappers under `src/lib/tauri.ts`.
- Keep domain types under `src/types/`.
- Keep cross-feature local state under `src/state/`.
- Components should be presentational when possible; data access should be isolated behind hooks or IPC wrappers.
- Prefer explicit TypeScript types and Zod validation for form inputs.
- Do not show enabled UI controls, metrics, charts, navigation items, or decorative icons that are not wired to real behavior or real local data.

### Rust Backend

- Follow `.agents/skills/rust-best-practices/SKILL.md` to the letter for every Rust implementation, review, refactor, test, and error-handling decision.
- Prefer borrowing over cloning unless ownership transfer is required; use `&str`/`&[T]` in internal functions where appropriate, while respecting Tauri async command owned-type requirements.
- Never use `unwrap()` or `expect()` in production Rust code; propagate fallible operations with `Result` and `?`.
- Prefer `thiserror` for domain/library errors and reserve `anyhow` for boundary glue where appropriate.
- Run Clippy for non-trivial Rust changes when feasible: `cd src-tauri && cargo clippy --all-targets --all-features --locked -- -D warnings`.
- Keep Tauri command adapters thin under `src-tauri/src/commands/`.
- Keep domain/data structs in `models.rs`.
- Keep persistence in `db.rs` and migrations in `migrations/`.
- Keep file scanning in `scanner.rs`.
- Keep metadata/audio probing in `metadata.rs` and `analysis.rs`.
- Keep matching rules in `matching.rs`.
- Keep set generation/export logic in `sets.rs` and `exports.rs`.
- Commands return `Result<T, String>` or a serializable error wrapper.
- Do not mutate original audio files.

## Testing Instructions

- Rust tests are required for scanner helpers, allowed audio formats, DB insert/update behavior, matching rules, set draft generation, and exports.
- Frontend must pass TypeScript build with `bun run build`.
- Add tests before implementing new domain rules whenever feasible.
- Use focused Rust tests during development: `cd src-tauri && cargo test <test_name>`.
- Run full verification before finalizing: `bun run build` and `cd src-tauri && cargo test`.

## Code Style

- Prefer minimal, direct implementations over speculative abstractions.
- Avoid backward compatibility code unless persisted data or external behavior requires it.
- Keep functions small enough to understand, but do not split code into unnecessary helpers.
- Use clear names that reflect DJ/product language: track, source, set, transition, match, analysis.
- Keep UI dark by default, dense, professional, and optimized for large music libraries.
- Avoid decorative AI-style UI. Prioritize precision, workflow, and control.

## Security And Privacy

- No network upload paths for audio or metadata.
- Request minimum filesystem permissions.
- Store routes, metadata, analysis, settings, and DB locally.
- Do not modify audio files.
- Removing a source must not delete files from disk.

## Commit Guidelines

- Use semantic commit prefixes such as `docs:`, `spec:`, `test:`, `feat:`, `fix:`, `refactor:`, `chore:`.
- Commit only related files.
- Inspect `git status`, `git diff`, and recent commits before committing.
- Do not amend unless explicitly requested.
- Do not use destructive git commands.
