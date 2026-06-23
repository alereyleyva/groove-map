# language: en

Feature: GrooveMap product intent
  GrooveMap is a local-first desktop app for techno DJs who manage downloaded music collections and prepare coherent sets.

  Background:
    Given the user is a techno DJ with local audio files
    And GrooveMap stores all state locally
    And GrooveMap never uploads audio, metadata, analysis, settings, or user configuration

  Scenario: MVP supports local DJ library preparation
    When the user selects one or more local music folders
    Then GrooveMap scans supported audio files
    And GrooveMap imports metadata without modifying original files
    And GrooveMap persists sources, tracks, analysis state, tags, ratings, notes, sets, and settings locally in SQLite
    And the user can explore tracks in a dense dark library UI
    And the user can edit structured DJ tags and manual overrides for BPM, key, Camelot, and energy
    And the user can create ordered sets and export them to CSV, JSON, and M3U
    And GrooveMap can calculate explainable compatibility scores between tracks
    And GrooveMap can suggest at least 10 candidate matches when enough library data exists

  Scenario: MVP avoids fragile non-goals
    Then GrooveMap does not promise perfect BPM or key detection
    And GrooveMap does not provide cloud sync
    And GrooveMap does not behave as a generic streaming player
    And GrooveMap does not require a Python or C++ sidecar

  Scenario: Product UI feels professional for DJs
    Then the interface is dark by default
    And the interface is dense but legible
    And the primary workflow is table-first
    And filters are clear and keyboard-friendly
    And recommendations are explained with musical reasoning
