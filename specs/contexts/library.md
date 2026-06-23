# language: en

Feature: Library
  Library owns track exploration, dense table display, search, filters, selection, and track detail access.

  Scenario: Display the main library table
    Given tracks exist in the local database
    When the user opens Library
    Then tracks are displayed in a dense dark table
    And the table includes title, artist, BPM, key, energy, mood, function, style, duration, rating, status, and path in the current MVP

  Scenario: Filter library tracks
    Given tracks exist in the local database
    When the user searches by title, artist, or filename
    Then the table only shows matching tracks
    When the user applies a BPM range or analysis status filter
    Then the table only shows tracks matching those filters

  Scenario: Select a track
    Given the user is viewing Library
    When the user selects a track
    Then the track detail panel opens
    And GrooveMap loads top matches for that track

  Scenario: Required complete library behavior
    Then the final table includes artwork, title, artist, BPM, key, Camelot, energy, mood, function, style, groove, duration, rating, last played, times used, tags, file path, and analysis status
    And the final UI supports sorting by any column
    And the final UI supports filters for BPM, key or Camelot, energy, mood, function, style, analysis status, and text search
    And saved views are persisted locally
    And bulk actions support tag edit, reanalysis, add to set, favorite, and discarded

  Scenario: Known library gaps
    Then table virtualization is not complete yet
    And full sorting UI is not complete yet
    And key, energy, mood, function, and style filters are not complete yet
    And saved views are not complete yet
    And bulk selection and actions are not complete yet
    And artwork, last played, and times used columns are not complete yet
