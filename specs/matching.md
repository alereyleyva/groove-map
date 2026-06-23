# language: en

Feature: Matching spec compatibility pointer
  Canonical matching behavior lives in specs/contexts/matching.md.

  Scenario: Resolve canonical matching spec
    When an agent needs matching behavior
    Then the agent reads specs/contexts/matching.md
