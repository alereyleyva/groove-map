export type TrackTag = {
  field: string;
  value: string;
};

export type Track = {
  id: number;
  sourceId?: number | null;
  filePath: string;
  fileName: string;
  fileHash: string;
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  genre?: string | null;
  year?: number | null;
  durationSeconds?: number | null;
  sampleRate?: number | null;
  bitrate?: number | null;
  format?: string | null;
  fileSize: number;
  modifiedAt?: string | null;
  artworkPath?: string | null;
  bpm?: number | null;
  bpmConfidence?: number | null;
  bpmSource?: string | null;
  musicalKey?: string | null;
  mode?: string | null;
  camelot?: string | null;
  keySource?: string | null;
  energyScore?: number | null;
  energySource?: string | null;
  analysisStatus: string;
  rating?: number | null;
  notes?: string | null;
  tags: TrackTag[];
  freeTags: string[];
};

export type TrackSummary = {
  tracks: Track[];
  total: number;
};

export type TrackFilters = {
  search?: string;
  bpmMin?: number;
  bpmMax?: number;
  key?: string;
  energyMin?: number;
  energyMax?: number;
  mood?: string;
  functionTag?: string;
  style?: string;
  groove?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

export type Source = {
  id: number;
  path: string;
  name: string;
  recursive: boolean;
  createdAt: string;
  updatedAt: string;
  lastScanAt?: string | null;
};

export type ScanResult = {
  sourceId: number;
  filesFound: number;
  tracksImported: number;
  skipped: number;
  errors: string[];
};

export type QueueStatus = {
  found: number;
  imported: number;
  pending: number;
  analyzing: number;
  done: number;
  failed: number;
  skipped: number;
};

export type MatchScore = {
  trackAId: number;
  trackBId: number;
  score: number;
  confidence: number;
  bpmScore: number;
  keyScore: number;
  energyScore: number;
  moodScore: number;
  functionScore: number;
  grooveScore: number;
  spectralScore: number;
  historyScore: number;
  explanation: string;
  indicator: string;
};

export type MatchRecommendation = MatchScore & {
  track: Track;
};

export type SetTrackRecord = {
  id: number;
  setId: number;
  trackId: number;
  position: number;
  locked: boolean;
  transitionNote?: string | null;
  transitionScore?: number | null;
  track?: Track | null;
};

export type SetRecord = {
  id: number;
  name: string;
  description?: string | null;
  context?: string | null;
  durationTargetMinutes?: number | null;
  energyArc?: string | null;
  bpmMin?: number | null;
  bpmMax?: number | null;
  notes?: string | null;
  tracks: SetTrackRecord[];
};

export type SetDraft = {
  name: string;
  tracks: Track[];
  totalDurationMinutes: number;
  warnings: string[];
  explanation: string;
};
