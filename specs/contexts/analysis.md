# language: en

Feature: Analysis
  Analysis owns background analysis state, audio feature extraction, confidence, and nullable handling for unavailable metrics.

  Scenario: Persist analysis queue state
    Given a track is imported
    Then track_analysis stores analysis version, status, timestamps, and nullable metrics
    And status is one of pending, analyzing, done, failed, or skipped
    And queue state persists across app restart

  Scenario: Display unavailable metrics safely
    Given a metric cannot be calculated in the MVP
    When the track is displayed
    Then GrooveMap shows the metric as unavailable or not analyzed
    And GrooveMap does not treat the missing metric as zero

  Scenario: Communicate analysis confidence honestly
    Then GrooveMap does not promise perfect BPM or key detection
    And GrooveMap stores confidence where available

  Scenario: Required analysis metrics
    Then analysis eventually supports duration, estimated BPM, BPM confidence, key, mode, Camelot, loudness, RMS, peak level, dynamic range, energy, danceability, percussiveness, brightness, darkness, low-end intensity, kick density, spectral centroid, spectral contrast, intro, outro, breakdown, main section estimates, and cue suggestions

  Scenario: Analysis queue controls
    Given analysis is running in the background
    When the user pauses, resumes, cancels, or retries failed analysis
    Then the queue state updates without blocking the Tauri main thread

  Scenario: Known analysis gaps
    Then a real background worker queue is not complete yet
    And pause, resume, cancel, and retry are not complete yet
    And RMS, peak, loudness, spectral, kick density, section detection, waveform, and cue suggestions are not complete yet
    And analysis error detail UI is not complete yet
