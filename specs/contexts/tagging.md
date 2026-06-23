# Tagging Context Spec

## Purpose

Tagging owns structured tags, free tags, notes, ratings, personal status, and manual correction of analysis values.

## Current Implementation

- Track detail can add structured field/value tags.
- Track notes can be saved.
- Manual BPM and Camelot override can be saved through `analyze_track`.
- Ratings are supported by backend command and data model.
- Free tags are supported by backend command and data model.

## Required Structured Fields

- Mood: `dark`, `hypnotic`, `driving`, `raw`, `industrial`, `mental`, `deep`, `trippy`, `emotional`, `cold`, `warm`, `aggressive`, `elegant`.
- Energy: `warmup`, `low`, `medium`, `high`, `peak`, `afterhours`.
- Function: `opener`, `builder`, `roller`, `tool`, `transition`, `peak-time`, `reset`, `closer`, `bridge`, `weapon`.
- Style: `hypnotic techno`, `raw techno`, `dub techno`, `industrial techno`, `hardgroove`, `tribal techno`, `minimal techno`, `acid techno`, `detroit`, `warehouse`, `ambient techno`.
- Groove: `straight`, `swing`, `rolling`, `broken`, `tribal`, `loopy`, `stomping`, `syncopated`.
- Vocal presence: `none`, `short vocal`, `spoken`, `chant`, `heavy vocal`.
- Mixability: `easy`, `medium`, `risky`, `difficult`.
- Personal status: `new`, `reviewed`, `tested`, `played live`, `favorite`, `discarded`, `needs cueing`.

## Gap To Proposal

- UI does not constrain values per field yet.
- No free tag editor in UI yet.
- No rating editor in UI yet.
- No batch tag editing yet.
- No manual key/mode/energy editor beyond BPM and Camelot.
- No validation schema for tag forms yet.

## Acceptance Criteria

- User can edit every structured field from controlled vocabularies.
- Manual BPM, key, Camelot, and energy override automatic analysis in matching.
- Free tags remain separate from structured tags.
