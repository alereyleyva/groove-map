# language: en

Feature: Settings and Privacy
  Settings and Privacy owns local preferences, matching weights, analysis defaults, filesystem permissions, database safety, and privacy guarantees.

  Background:
    Given GrooveMap stores all application state locally

  Scenario: Store settings locally
    Given the user changes app settings
    When the settings are saved
    Then settings are persisted in the local SQLite database
    And settings are available after app restart

  Scenario: Persist local DJ preparation state
    When the user prepares their library and sets
    Then GrooveMap persists sources, tracks, analysis state, tags, ratings, notes, sets, and settings locally in SQLite

  Scenario: Preserve privacy guarantees
    Given GrooveMap imports local music
    Then GrooveMap never uploads audio files
    And GrooveMap never uploads metadata
    And GrooveMap never uploads analysis
    And GrooveMap never uploads settings
    And GrooveMap never uploads user configuration
    And GrooveMap does not provide cloud sync
    And GrooveMap never mutates original audio files
    And removing a source never deletes files from disk

  Scenario: Configure required settings
    Then settings include theme as dark, light, or system
    And settings include default BPM range
    And settings include default set duration
    And settings include default analysis concurrency
    And settings include matching weights
    And settings include excluded folders
    And settings include allowed audio formats
    And settings include manual override priority
    And settings include database backup
    And settings include database reset

  Scenario: Reset the database safely
    Given the user requests database reset
    When GrooveMap asks for explicit confirmation
    And the user confirms
    Then local GrooveMap data is reset
    And original audio files remain untouched

  Scenario: Known settings and privacy gaps
    Then matching weights UI is not complete yet
    And excluded folders UI is not complete yet
    And allowed formats UI is not complete yet
    And backup and reset workflows are not complete yet
    And theme application is not complete yet
