# language: en

Feature: Matching
  Matching owns compatibility scoring between tracks and explainable recommendations.

  Scenario: Calculate a weighted compatibility score
    Given two candidate tracks
    When GrooveMap calculates their match
    Then the result includes total score from 0 to 100
    And the result includes confidence
    And the result includes BPM, key, energy, mood, function, groove, spectral, and history component scores
    And the result includes a short musical explanation
    And the result includes an indicator of safe, interesting, risky, or wildcard

  Scenario: Score BPM compatibility
    Given two tracks have BPM values
    When their BPM difference is less than or equal to 1
    Then BPM score is 100
    When their BPM difference is less than or equal to 2
    Then BPM score is 90
    When their BPM difference is less than or equal to 4
    Then BPM score is 75
    When their BPM difference is less than or equal to 6
    Then BPM score is 50
    When their BPM difference is less than or equal to 8
    Then BPM score is 25
    When their BPM difference is greater than 8
    Then BPM score is 10

  Scenario: Score Camelot compatibility
    Given two tracks have Camelot keys
    When their Camelot key is the same
    Then key score is 100
    When their Camelot key is adjacent with the same letter
    Then key score is 90
    When their Camelot number is the same and letter differs
    Then key score is 85
    When either key is unknown
    Then key score is 50
    When keys are incompatible
    Then key score is 25

  Scenario: Apply default matching weights
    Then BPM weight is 25 percent
    And key weight is 15 percent
    And energy weight is 20 percent
    And mood weight is 10 percent
    And function weight is 10 percent
    And groove weight is 10 percent
    And spectral weight is 5 percent
    And history or preference weight is 5 percent

  Scenario: Exclude discarded recommendations
    Given a candidate track is marked discarded
    When GrooveMap finds matches
    Then the discarded candidate is excluded

  Scenario: Display complete match candidates
    Given GrooveMap returns match recommendations
    When the recommendations are displayed in the track detail panel
    Then each recommendation shows the candidate title, artist, BPM, key, score, indicator, and explanation

  Scenario: Suggest enough match candidates for preparation
    Given enough library data exists
    When GrooveMap suggests candidate matches for a track
    Then GrooveMap returns at least 10 candidate matches
    And recommendations are explained with musical reasoning

  Scenario: Known matching gaps
    Then context-aware matching is not complete yet
    And settings-driven weights are not complete yet
    And full mood-neighbor rules are not complete yet
    And spectral scoring is not complete yet
    And transition feedback history is not complete yet
    And match score caching is not complete yet
