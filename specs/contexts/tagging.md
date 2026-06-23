# language: en

Feature: Tagging
  Tagging owns structured tags, free tags, notes, ratings, personal status, and manual correction of analysis values.

  Scenario: Add structured tags
    Given a track exists
    When the user adds a structured field and value tag
    Then the tag is stored locally for that track
    And the tag remains separate from free tags

  Scenario: Save notes and ratings
    Given a track exists
    When the user saves a personal note or rating
    Then the note or rating is persisted locally

  Scenario: Override automatic analysis manually
    Given a track has automatic or missing analysis values
    When the user manually corrects BPM, key, Camelot, or energy
    Then the manual value takes precedence in UI and matching
    And the source field records manual priority

  Scenario: Controlled structured tag vocabularies
    Then Mood supports dark, hypnotic, driving, raw, industrial, mental, deep, trippy, emotional, cold, warm, aggressive, and elegant
    And Energy supports warmup, low, medium, high, peak, and afterhours
    And Function supports opener, builder, roller, tool, transition, peak-time, reset, closer, bridge, and weapon
    And Style supports hypnotic techno, raw techno, dub techno, industrial techno, hardgroove, tribal techno, minimal techno, acid techno, detroit, warehouse, and ambient techno
    And Groove supports straight, swing, rolling, broken, tribal, loopy, stomping, and syncopated
    And Vocal presence supports none, short vocal, spoken, chant, and heavy vocal
    And Mixability supports easy, medium, risky, and difficult
    And Personal status supports new, reviewed, tested, played live, favorite, discarded, and needs cueing

  Scenario: Known tagging gaps
    Then controlled-value tag UI is not complete yet
    And free tag editor UI is not complete yet
    And rating editor UI is not complete yet
    And batch tag editing is not complete yet
    And manual key, mode, and energy editor coverage is not complete yet
