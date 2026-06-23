# language: en

Feature: Set Builder
  Set Builder owns assisted generation of draft sets from library constraints and DJ intent.

  Scenario: Configure a set draft
    Given the user wants an assisted set draft
    When the user chooses duration target, BPM range, dominant mood, energy arc, required tracks, excluded tracks, starting track, ending track, and wildcard allowance
    Then those constraints are used by the draft generation algorithm

  Scenario: Generate a compatible draft
    Given enough eligible tracks exist
    When GrooveMap generates a draft set
    Then selected tracks avoid abrupt BPM jumps
    And selected tracks maintain tonal compatibility where possible
    And selected tracks respect the target energy arc
    And selected tracks avoid repeating artists too closely
    And selected tracks prioritize high ratings
    And selected tracks exclude discarded tracks
    And selected tracks favor easy or medium mixability

  Scenario: Save a draft as a set
    Given a draft has been generated
    When the user saves it as a set
    Then a set is created locally
    And the generated track order is preserved

  Scenario: Explain draft risks
    Given a draft contains risky transitions or incomplete data
    Then GrooveMap explains the overall arc
    And GrooveMap lists notable risks and warnings

  Scenario: Known set builder gaps
    Then required, excluded, start, and end track UI is not complete yet
    And artist spacing is not complete yet
    And wildcard logic is not complete yet
    And energy arc behavior is shallow
    And key progression enforcement is not complete yet
    And draft explanations are generic
    And BPM and energy charts are not complete yet
