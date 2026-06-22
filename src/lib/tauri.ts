import { invoke } from "@tauri-apps/api/core";
import type {
  MatchScore,
  QueueStatus,
  ScanResult,
  SetDraft,
  SetRecord,
  Source,
  Track,
  TrackFilters,
  TrackSummary,
  TrackTag,
} from "../types/domain";

export const api = {
  selectMusicFolder: () => invoke<string | null>("select_music_folder"),
  addSource: (path: string, recursive: boolean) =>
    invoke<Source>("add_source", { request: { path, recursive } }),
  scanSource: (sourceId: number) => invoke<ScanResult>("scan_source", { sourceId }),
  listTracks: (filters: TrackFilters) => invoke<TrackSummary>("list_tracks", { filters }),
  getTrack: (trackId: number) => invoke<Track>("get_track", { trackId }),
  updateTrackTags: (trackId: number, structuredTags: TrackTag[], freeTags: string[]) =>
    invoke<Track>("update_track_tags", { request: { trackId, structuredTags, freeTags } }),
  updateTrackRating: (trackId: number, rating: number | null) =>
    invoke<Track>("update_track_rating", { request: { trackId, rating } }),
  updateTrackNotes: (trackId: number, note: string) =>
    invoke<Track>("update_track_notes", { request: { trackId, note } }),
  analyzeTrack: (request: {
    trackId: number;
    bpm?: number | null;
    musicalKey?: string | null;
    camelot?: string | null;
    energyScore?: number | null;
  }) => invoke<Track>("analyze_track", { request }),
  getAnalysisQueueStatus: () => invoke<QueueStatus>("get_analysis_queue_status"),
  findMatchesForTrack: (trackId: number, limit = 10) =>
    invoke<MatchScore[]>("find_matches_for_track", { trackId, limit }),
  listSets: () => invoke<SetRecord[]>("list_sets"),
  createSet: (request: {
    name: string;
    description?: string | null;
    context?: string | null;
    durationTargetMinutes?: number | null;
    energyArc?: string | null;
    bpmMin?: number | null;
    bpmMax?: number | null;
    notes?: string | null;
  }) => invoke<SetRecord>("create_set", { request }),
  addTrackToSet: (setId: number, trackId: number) =>
    invoke<SetRecord>("add_track_to_set", { request: { setId, trackId } }),
  removeTrackFromSet: (setId: number, trackId: number) =>
    invoke<SetRecord>("remove_track_from_set", { setId, trackId }),
  generateSetDraft: (request: {
    name: string;
    durationTargetMinutes?: number | null;
    bpmMin?: number | null;
    bpmMax?: number | null;
    mood?: string | null;
    energyArc?: string | null;
    requiredTrackIds: number[];
    excludedTrackIds: number[];
  }) => invoke<SetDraft>("generate_set_draft", { request }),
  exportSetCsv: (setId: number) => invoke<string>("export_set_csv", { setId }),
  exportSetJson: (setId: number) => invoke<string>("export_set_json", { setId }),
  exportSetM3u: (setId: number) => invoke<string>("export_set_m3u", { setId }),
  getSettings: () => invoke<Record<string, unknown>>("get_settings"),
  updateSettings: (settings: Record<string, unknown>) =>
    invoke<Record<string, unknown>>("update_settings", { settings }),
};
