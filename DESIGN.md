---
version: alpha
name: GrooveMap Studio
description: Dense, dark, offline-first DJ library interface for local techno preparation.
colors:
  primary: "#090B0D"
  surface: "#0D1011"
  surface-raised: "#111518"
  surface-table: "#101312"
  border: "#27272A"
  border-muted: "#18181B"
  text-primary: "#F4F4F5"
  text-secondary: "#D4D4D8"
  text-muted: "#8B8B94"
  accent: "#22D3EE"
  accent-strong: "#06B6D4"
  selection: "#12343A"
  danger: "#F87171"
typography:
  app-title:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 2rem
    letterSpacing: -0.02em
  panel-title:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 2rem
    letterSpacing: -0.025em
  body:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  table-cell:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  label-caps:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1rem
    letterSpacing: 0.08em
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
components:
  app-shell:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-secondary}"
  sidebar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    width: 244px
  nav-item-active:
    backgroundColor: "{colors.selection}"
    textColor: "{colors.text-primary}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: 60px
    padding: 24px
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    height: 60px
    padding: 24px
  input-search:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: 60px
  table-row-active:
    backgroundColor: "{colors.selection}"
    textColor: "{colors.text-primary}"
  table-container:
    backgroundColor: "{colors.surface-table}"
    textColor: "{colors.text-secondary}"
  border-sample:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text-primary}"
  border-muted-sample:
    backgroundColor: "{colors.border-muted}"
    textColor: "{colors.text-primary}"
  metadata-label:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-muted}"
  accent-action:
    backgroundColor: "{colors.accent-strong}"
    textColor: "{colors.primary}"
  danger-action:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.primary}"
  track-inspector:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    width: 408px
---

## Overview

GrooveMap is a technical desktop workspace for techno DJs preparing local music libraries. The design should feel like a compact studio tool: dark, dense, fast, and precise. It should not feel like a consumer streaming product, a marketing dashboard, or a decorative AI-generated concept.

The interface prioritizes real library operations: importing local folders, filtering large track lists, inspecting metadata, tagging, matching, building sets, and monitoring local analysis state.

## Colors

The palette is intentionally restrained: near-black surfaces, zinc-like borders, high-contrast text, and cyan for actions or analysis state.

- **Primary (`#090B0D`)** is the application canvas.
- **Surface (`#0D1011`)** and **surface-raised (`#111518`)** separate panels without bright contrast.
- **Border (`#27272A`)** is used for structural panel edges, tables, chips, inputs, and controls.
- **Text primary (`#F4F4F5`)** is reserved for selected titles, key values, and active navigation.
- **Text muted (`#8B8B94`)** is used for metadata, empty states, secondary labels, and paths.
- **Accent (`#22D3EE`)** marks primary actions, selected states, progress, and match/key emphasis.
- **Danger (`#F87171`)** is only for destructive or error states.

Do not introduce additional decorative accent colors unless a new semantic state requires one.

## Typography

Use a system sans stack through Tailwind defaults. Typography should be compact and utilitarian.

- App and panel titles use `app-title` or `panel-title` scale.
- Table rows use `table-cell` scale with truncation for long metadata.
- Labels, headers, and section titles use `label-caps` with uppercase styling.
- Avoid oversized hero type. GrooveMap is a working tool, not a landing page.

## Layout

The canonical desktop layout is a three-zone workspace.

- Left sidebar: persistent navigation and real local library counts.
- Center library: search, functional filters, source chips, table, pagination.
- Right inspector: selected track details, real tags, available analysis fields, match recommendations, and edit controls.
- Bottom footer: real queue state and navigation to the queue view.

Spacing should remain compact. Rows should be dense enough for large collections while preserving click targets. Long filenames, paths, artists, and tags must truncate rather than expand the layout.

On narrower screens, the right inspector may be hidden, but the library table and import/source controls must remain usable.

## Elevation & Depth

Use subtle panel separation instead of shadows. Depth comes from borders, slight surface changes, and selected-row tinting.

- Prefer `border-zinc-800` or equivalent tokenized borders.
- Avoid heavy glows, glassmorphism, decorative blur, and floating cards.
- Selected rows and active nav items use a low-opacity cyan background, not a bright fill.

## Shapes

Use small, consistent radii.

- Inputs and primary controls use `rounded.md`.
- Table containers and inspector cards use `rounded.lg`.
- Folder/source chips use `rounded.pill`.
- Avoid fully rounded large panels except for chips and toggles.

## Components

Every component must be wired to real application behavior or rendered as non-interactive text.

- Search updates the backend track query.
- Filter controls update the backend `TrackFilters` values.
- Source chips reflect persisted SQLite `sources` and filter by `sourceId`.
- Import Folder opens the local folder picker, persists a source, scans it, and focuses that source.
- Rescan scans the selected source, or all sources when no source is selected.
- Track rows select a real track and load real local match recommendations.
- Inspector values come from the selected track record or are omitted with an empty state.
- Queue footer uses real queue counts and navigates to the queue view.

## Do's and Don'ts

Do keep the UI dark, compact, and optimized for DJ library workflow.

Do keep controls visibly consistent with the screenshot-inspired layout while preserving real behavior.

Do use empty states when data is missing, for example `No tags yet. Add tags in Edit.`

Do remove or disable a control if its backend/domain behavior does not exist yet.

Do keep folder/source management local-only and backed by SQLite.

Don't display fake metrics, fake waveform data, fake artwork, fake ETA values, fake feature values, or fake analysis progress.

Don't show enabled buttons for future capabilities such as auto-analysis, waveform display, or artwork extraction until those features are implemented.

Don't use decorative icons as controls unless they have an accessible label and a real action.

Don't add a navigation item unless it routes to a real implemented view.

Don't upload audio, metadata, analysis, tags, settings, source paths, or user configuration.
