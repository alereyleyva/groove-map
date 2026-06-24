use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Source {
    pub id: i64,
    pub path: String,
    pub name: String,
    pub recursive: bool,
    pub created_at: String,
    pub updated_at: String,
    pub last_scan_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Track {
    pub id: i64,
    pub source_id: Option<i64>,
    pub file_path: String,
    pub file_name: String,
    pub file_hash: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub genre: Option<String>,
    pub year: Option<i64>,
    pub duration_seconds: Option<f64>,
    pub sample_rate: Option<i64>,
    pub bitrate: Option<i64>,
    pub format: Option<String>,
    pub file_size: i64,
    pub modified_at: Option<String>,
    pub artwork_path: Option<String>,
    pub bpm: Option<f64>,
    pub bpm_confidence: Option<f64>,
    pub bpm_source: Option<String>,
    pub musical_key: Option<String>,
    pub mode: Option<String>,
    pub camelot: Option<String>,
    pub key_source: Option<String>,
    pub energy_score: Option<f64>,
    pub energy_source: Option<String>,
    pub analysis_status: String,
    pub rating: Option<i64>,
    pub notes: Option<String>,
    pub tags: Vec<TrackTag>,
    pub free_tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackTag {
    pub field: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackSummary {
    pub tracks: Vec<Track>,
    pub total: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddSourceRequest {
    pub path: String,
    pub recursive: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub source_id: i64,
    pub files_found: usize,
    pub tracks_imported: usize,
    pub skipped: usize,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackFilters {
    pub source_id: Option<i64>,
    pub search: Option<String>,
    pub bpm_min: Option<f64>,
    pub bpm_max: Option<f64>,
    pub key: Option<String>,
    pub energy_min: Option<f64>,
    pub energy_max: Option<f64>,
    pub mood: Option<String>,
    pub function_tag: Option<String>,
    pub style: Option<String>,
    pub groove: Option<String>,
    pub status: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTagsRequest {
    pub track_id: i64,
    pub structured_tags: Vec<TrackTag>,
    pub free_tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateRatingRequest {
    pub track_id: i64,
    pub rating: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNotesRequest {
    pub track_id: i64,
    pub note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ManualAnalysisRequest {
    pub track_id: i64,
    pub bpm: Option<f64>,
    pub musical_key: Option<String>,
    pub camelot: Option<String>,
    pub energy_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueueStatus {
    pub found: i64,
    pub imported: i64,
    pub pending: i64,
    pub analyzing: i64,
    pub done: i64,
    pub failed: i64,
    pub skipped: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchScore {
    pub track_a_id: i64,
    pub track_b_id: i64,
    pub score: f64,
    pub confidence: f64,
    pub bpm_score: f64,
    pub key_score: f64,
    pub energy_score: f64,
    pub mood_score: f64,
    pub function_score: f64,
    pub groove_score: f64,
    pub spectral_score: f64,
    pub history_score: f64,
    pub explanation: String,
    pub indicator: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetRecord {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub context: Option<String>,
    pub duration_target_minutes: Option<i64>,
    pub energy_arc: Option<String>,
    pub bpm_min: Option<f64>,
    pub bpm_max: Option<f64>,
    pub notes: Option<String>,
    pub tracks: Vec<SetTrackRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetTrackRecord {
    pub id: i64,
    pub set_id: i64,
    pub track_id: i64,
    pub position: i64,
    pub locked: bool,
    pub transition_note: Option<String>,
    pub transition_score: Option<f64>,
    pub track: Option<Track>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSetRequest {
    pub name: String,
    pub description: Option<String>,
    pub context: Option<String>,
    pub duration_target_minutes: Option<i64>,
    pub energy_arc: Option<String>,
    pub bpm_min: Option<f64>,
    pub bpm_max: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddTrackToSetRequest {
    pub set_id: i64,
    pub track_id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReorderSetTracksRequest {
    pub set_id: i64,
    pub track_ids: Vec<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateSetDraftRequest {
    pub name: String,
    pub duration_target_minutes: Option<i64>,
    pub bpm_min: Option<f64>,
    pub bpm_max: Option<f64>,
    pub mood: Option<String>,
    pub energy_arc: Option<String>,
    pub required_track_ids: Vec<i64>,
    pub excluded_track_ids: Vec<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetDraft {
    pub name: String,
    pub tracks: Vec<Track>,
    pub total_duration_minutes: f64,
    pub warnings: Vec<String>,
    pub explanation: String,
}
