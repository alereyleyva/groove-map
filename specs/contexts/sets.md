# language: en

Feature: Sets
  Sets owns set lifecycle, ordered tracks, transition notes, compatibility warnings, usage history, and exports.

  Scenario: Create a set
    Given the user is preparing a session
    When the user creates a set with name, context, target duration, energy arc, BPM range, and notes
    Then the set is persisted locally

  Scenario: Add and remove tracks
    Given a set exists
    And a track exists in the library
    When the user adds the track to the set
    Then the track appears at the next set position
    When the user removes the track from the set
    Then the track is removed without deleting the original audio file
    And remaining positions are normalized

  Scenario: Reorder and lock set tracks
    Given a set contains multiple tracks
    When the user reorders tracks by drag and drop
    Then the new order is persisted
    When a track is locked
    Then assisted operations do not move the locked track

  Scenario: Display set progression
    Given a set contains analyzed tracks
    Then GrooveMap displays accumulated duration
    And GrooveMap displays BPM progression
    And GrooveMap displays energy progression
    And GrooveMap displays key progression
    And GrooveMap displays warnings for incompatible adjacent transitions

  Scenario: Export a set
    Given a set contains ordered tracks
    When the user exports CSV, JSON, M3U, or text tracklist
    Then the export preserves final set order
    And the export includes enough track metadata for DJ use

  Scenario: Known sets gaps
    Then drag-and-drop reorder UI is not complete yet
    And locked-track UI is not complete yet
    And transition notes UI is not complete yet
    And compatibility warnings are not complete yet
    And BPM, energy, and key progression charts are not complete yet
    And duplicate set action is not complete yet
    And text tracklist export is not complete yet
    And play history usage is not complete yet
