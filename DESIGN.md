---
version: alpha
name: GrooveMap Desktop
description: Dense, dark, local-only desktop workspace for techno DJ library preparation.
colors:
  primary: "#0F1213"
  window: "#000000"
  canvas: "#0F1213"
  surface: "#101314"
  surface-raised: "#111516"
  surface-active: "#252A2D"
  surface-chip: "#303639"
  border: "#303437"
  border-strong: "#34383B"
  border-muted: "#262B2E"
  text-primary: "#F0F2F2"
  text-secondary: "#D4D7D8"
  text-muted: "#858B90"
  text-subtle: "#5C6368"
  accent: "#78C7E8"
  accent-muted: "#1C333D"
  accent-contrast: "#101416"
  danger: "#F87171"
typography:
  app-title:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.75rem
    letterSpacing: -0.03em
  page-title:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 2rem
    letterSpacing: -0.03em
  nav-item:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.75rem
  body:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  table-cell:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5rem
  metadata-label:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5rem
rounded:
  sm: 4px
  md: 6px
  lg: 10px
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
    rounded: "{rounded.lg}"
  sidebar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    width: 276px
  nav-item-active:
    backgroundColor: "{colors.surface-active}"
    textColor: "{colors.text-primary}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-contrast}"
    rounded: "{rounded.md}"
    height: 60px
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    height: 60px
  input-search:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: 60px
  filter-button:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    height: 48px
  table-row-active:
    backgroundColor: "{colors.accent-muted}"
    textColor: "{colors.text-primary}"
  table-container:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
  track-inspector:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    width: 392px
---

## Overview

GrooveMap is a technical desktop workspace for techno DJs preparing local libraries. The visual direction is based on a single-window dark studio tool: persistent left navigation, a dominant center table, a fixed right track inspector, and a compact status footer.

The interface should feel precise, utilitarian, and local-first. It should not feel like a streaming app, dashboard template, marketing page, or decorative AI concept.

## Colors

The palette uses almost-black surfaces, visible graphite borders, cool gray typography, and one muted blue-cyan accent.

- **Window (`#000000`)** is the outside frame around the app shell.
- **Canvas (`#0F1213`)** is the root application surface.
- **Surface (`#101314`)** and **surface-raised (`#111516`)** separate workspace regions and controls.
- **Surface-active (`#252A2D`)** is used for selected navigation.
- **Surface-chip (`#303639`)** is used for tags and compact metadata chips.
- **Border (`#303437`)** and **border-strong (`#34383B`)** define panels, controls, table rows, and inputs.
- **Text primary (`#F0F2F2`)** is reserved for selected titles, active navigation, page titles, and important values.
- **Text muted (`#858B90`)** is used for metadata labels, empty states, footer status, and helper text.
- **Accent (`#78C7E8`)** marks the primary action, active row strip, progress, and focus states.
- **Danger (`#F87171`)** is only for destructive or error states.

Do not introduce additional accent colors unless there is a new semantic state that needs one.

## Typography

Use the system sans stack through Tailwind defaults. Typography is compact but slightly larger than a dashboard table so it reads like desktop software.

- App title uses `app-title`.
- Page titles use `page-title`.
- Sidebar items use `nav-item`.
- Library rows use `table-cell`.
- Inspector labels use `metadata-label` with muted text.
- Avoid hero type, marketing headings, oversized cards, and decorative display fonts.

## Layout

The canonical desktop layout is a four-zone workspace.

- Left sidebar: persistent navigation, 276px wide, dark gradient surface, active item with a cyan left strip.
- Center library: top search/action bar, compact filters, source chips, dense table, pagination controls.
- Right inspector: selected track fields, tags, notes, set action, analysis override, tagging controls, and local match recommendations.
- Bottom footer: real local queue status, imported track count, pending count, active analysis count, and progress.

The table is the visual center of the app. Rows should be dense, horizontally aligned, and separated by thin borders. Long titles, artists, paths, and tags must truncate or wrap only inside their assigned column.

On narrower screens, the inspector and sidebar may collapse or hide first. The library table, import action, and source filters must remain usable.

## Elevation & Depth

Use borders, subtle gradients, and slight surface changes instead of shadows.

- The outer shell has a single rounded frame and restrained shadow.
- Sidebar and inspector use vertical gradients from raised black to near-black.
- Active rows use a muted blue-cyan tint plus a left cyan strip.
- Avoid glassmorphism, bright glows, floating cards, heavy blur, and decorative artwork blocks.

## Shapes

Use small, consistent radii.

- App shell uses `rounded.lg`.
- Buttons, inputs, filters, panels, and textareas use `rounded.md`.
- Tags and source filters may use `rounded.pill` or compact rounded rectangles.
- Avoid fully rounded large panels except for chips and toggles.

## Components

Every component must be wired to real local behavior or rendered disabled/non-interactive.

- Search updates the backend track query.
- Filter controls update backend `TrackFilters` values.
- Source chips reflect persisted SQLite `sources` and filter by `sourceId`.
- Import Folder opens the local folder picker, persists a source, scans it, and focuses that source.
- Rescan scans the selected source, or all sources when no source is selected.
- Analyze may appear disabled until real automatic analysis behavior is implemented.
- Track rows select a real track and load real local match recommendations.
- Inspector values come from the selected track record or show an empty state.
- Notes, tags, rating, set assignment, and analysis overrides must persist through existing backend commands.
- Footer queue values must use real local queue state and navigate to the queue view where applicable.

## Do's And Don'ts

Do keep the UI dark, compact, table-first, and optimized for DJ library workflow.

Do preserve the screenshot-inspired hierarchy: sidebar, top toolbar, compact filters, table, inspector, footer.

Do use empty states when data is missing, for example `No tags yet. Add tags below.`

Do disable or remove controls when backend/domain behavior does not exist yet.

Do keep folder/source management local-only and backed by SQLite.

Don't display fake metrics, fake waveform data, fake artwork, fake ETA values, fake feature values, or fake analysis progress.

Don't show enabled buttons for future capabilities such as auto-analysis, waveform display, or artwork extraction until those features are implemented.

Don't use decorative icons as controls unless they have an accessible label and a real action.

Don't add a navigation item unless it routes to a real implemented view.

Don't upload audio, metadata, analysis, tags, settings, source paths, or user configuration.
