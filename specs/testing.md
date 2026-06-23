# language: en

Feature: Testing workflow
  All behavior changes should be driven by specs and covered by tests where feasible.

  Scenario: Backend behavior has Rust tests
    Given a behavior change affects scanner, persistence, matching, sets, or exports
    When the change is implemented
    Then a Rust test exists for the changed behavior where feasible
    And `cd src-tauri && cargo test` passes

  Scenario: Frontend behavior type-checks and builds
    Given a behavior change affects React or TypeScript
    When the change is implemented
    Then `bun run build` passes

  Scenario: Required test areas remain covered
    Then tests cover audio format detection
    And tests cover folder scanner helpers
    And tests cover SQLite migrations and track insert or update behavior
    And tests cover structured tag updates
    And tests cover BPM scoring
    And tests cover Camelot or key scoring
    And tests cover total matching score and explanation generation
    And tests cover set draft generation
    And tests cover CSV, JSON, and M3U export formatting
