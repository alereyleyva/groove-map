# language: en

Feature: Ingestion
  Ingestion owns selecting local music folders, scanning supported files, importing file identity and metadata, and preserving source state locally.

  Background:
    Given GrooveMap is running offline
    And original audio files must never be modified

  Scenario: Import a local source
    When the user selects a local music folder
    And the user chooses whether scanning is recursive
    Then the folder is persisted as a source
    And the source stores path, name, recursive flag, created time, updated time, and last scan time

  Scenario: Scan supported audio files
    Given a source exists
    When GrooveMap scans the source
    Then files with extensions mp3, wav, aiff, aif, flac, m4a, and ogg are detected case-insensitively
    And unsupported files are ignored
    And each imported track stores absolute path, file name, SHA-256 hash, size, modified time, format, and available metadata
    And imported tracks start with analysis status pending unless metadata marks them otherwise

  Scenario: Avoid duplicate file path imports
    Given a source has already been scanned
    When the same source is scanned again
    Then existing file paths are not duplicated

  Scenario: Manage multiple local sources
    Given multiple local music folders have been imported
    When the user opens the library
    Then GrooveMap lists the imported sources with their names, paths, recursive flags, and last scan times
    And the user can select a source to focus the library table on tracks from that source
    And the user can rescan each source independently

  Scenario: Handle scan failures clearly
    When a file or folder cannot be read
    Then GrooveMap records a clear local error
    And scanning continues for other readable files where possible

  Scenario: Known ingestion gaps
    Then source removal UI is not complete yet
    And duplicate resolution UI is not complete yet
    And incremental moved or deleted file detection is not complete yet
    And per-file scan error table UI is not complete yet
