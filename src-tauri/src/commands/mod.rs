use std::{path::PathBuf, sync::Mutex};

use tauri_plugin_dialog::DialogExt;

use crate::{db, exports, matching, models::*, sets};

pub struct AppState {
    pub db_path: Mutex<PathBuf>,
}

fn with_conn<T>(state: tauri::State<'_, AppState>, action: impl FnOnce(&rusqlite::Connection) -> anyhow::Result<T>) -> Result<T, String> {
    let path = state.db_path.lock().map_err(|error| error.to_string())?.clone();
    let conn = db::connect(&path).map_err(|error| error.to_string())?;
    action(&conn).map_err(|error| error.to_string())
}

fn with_conn_mut<T>(state: tauri::State<'_, AppState>, action: impl FnOnce(&mut rusqlite::Connection) -> anyhow::Result<T>) -> Result<T, String> {
    let path = state.db_path.lock().map_err(|error| error.to_string())?.clone();
    let mut conn = db::connect(&path).map_err(|error| error.to_string())?;
    action(&mut conn).map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn select_music_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let folder = app.dialog().file().blocking_pick_folder();
    Ok(folder.map(|path| path.to_string()))
}

#[tauri::command]
pub async fn add_source(state: tauri::State<'_, AppState>, request: AddSourceRequest) -> Result<Source, String> {
    with_conn(state, |conn| Ok(db::add_source(conn, request)?))
}

#[tauri::command]
pub async fn list_sources(state: tauri::State<'_, AppState>) -> Result<Vec<Source>, String> {
    with_conn(state, |conn| Ok(db::list_sources(conn)?))
}

#[tauri::command]
pub async fn scan_source(state: tauri::State<'_, AppState>, source_id: i64) -> Result<ScanResult, String> {
    with_conn(state, |conn| Ok(db::scan_source(conn, source_id)?))
}

#[tauri::command]
pub async fn rescan_source(state: tauri::State<'_, AppState>, source_id: i64) -> Result<ScanResult, String> {
    scan_source(state, source_id).await
}

#[tauri::command]
pub async fn list_tracks(state: tauri::State<'_, AppState>, filters: TrackFilters) -> Result<TrackSummary, String> {
    with_conn(state, |conn| Ok(db::list_tracks(conn, filters)?))
}

#[tauri::command]
pub async fn get_track(state: tauri::State<'_, AppState>, track_id: i64) -> Result<Track, String> {
    with_conn(state, |conn| Ok(db::get_track(conn, track_id)?))
}

#[tauri::command]
pub async fn update_track_tags(state: tauri::State<'_, AppState>, request: UpdateTagsRequest) -> Result<Track, String> {
    with_conn_mut(state, |conn| Ok(db::update_track_tags(conn, request)?))
}

#[tauri::command]
pub async fn update_track_rating(state: tauri::State<'_, AppState>, request: UpdateRatingRequest) -> Result<Track, String> {
    with_conn(state, |conn| Ok(db::update_track_rating(conn, request)?))
}

#[tauri::command]
pub async fn update_track_notes(state: tauri::State<'_, AppState>, request: UpdateNotesRequest) -> Result<Track, String> {
    with_conn(state, |conn| Ok(db::update_track_notes(conn, request)?))
}

#[tauri::command]
pub async fn analyze_track(state: tauri::State<'_, AppState>, request: ManualAnalysisRequest) -> Result<Track, String> {
    with_conn(state, |conn| Ok(db::update_manual_analysis(conn, request)?))
}

#[tauri::command]
pub async fn analyze_tracks_batch(state: tauri::State<'_, AppState>, requests: Vec<ManualAnalysisRequest>) -> Result<Vec<Track>, String> {
    with_conn(state, |conn| requests.into_iter().map(|request| Ok(db::update_manual_analysis(conn, request)?)).collect::<anyhow::Result<Vec<_>>>())
}

#[tauri::command]
pub async fn get_analysis_queue_status(state: tauri::State<'_, AppState>) -> Result<QueueStatus, String> {
    with_conn(state, |conn| Ok(db::queue_status(conn)?))
}

#[tauri::command]
pub async fn find_matches_for_track(state: tauri::State<'_, AppState>, track_id: i64, limit: Option<i64>) -> Result<Vec<MatchScore>, String> {
    with_conn(state, |conn| {
        let track = db::get_track(conn, track_id)?;
        let candidates = db::list_tracks(conn, TrackFilters { limit: Some(1000), offset: Some(0), ..TrackFilters::default() })?.tracks;
        let mut scores: Vec<_> = candidates.into_iter()
            .filter(|candidate| candidate.id != track_id)
            .filter(|candidate| !candidate.tags.iter().any(|tag| tag.field == "status" && tag.value == "discarded"))
            .map(|candidate| matching::calculate_match(&track, &candidate))
            .collect();
        scores.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        scores.truncate(limit.unwrap_or(10).max(1) as usize);
        Ok(scores)
    })
}

#[tauri::command]
pub async fn create_set(state: tauri::State<'_, AppState>, request: CreateSetRequest) -> Result<SetRecord, String> { with_conn(state, |conn| Ok(sets::create_set(conn, request)?)) }

#[tauri::command]
pub async fn update_set(state: tauri::State<'_, AppState>, set_id: i64, request: CreateSetRequest) -> Result<SetRecord, String> { with_conn(state, |conn| Ok(sets::update_set(conn, set_id, request)?)) }

#[tauri::command]
pub async fn delete_set(state: tauri::State<'_, AppState>, set_id: i64) -> Result<(), String> { with_conn(state, |conn| Ok(sets::delete_set(conn, set_id)?)) }

#[tauri::command]
pub async fn list_sets(state: tauri::State<'_, AppState>) -> Result<Vec<SetRecord>, String> { with_conn(state, |conn| Ok(sets::list_sets(conn)?)) }

#[tauri::command]
pub async fn add_track_to_set(state: tauri::State<'_, AppState>, request: AddTrackToSetRequest) -> Result<SetRecord, String> { with_conn(state, |conn| Ok(sets::add_track_to_set(conn, request)?)) }

#[tauri::command]
pub async fn remove_track_from_set(state: tauri::State<'_, AppState>, set_id: i64, track_id: i64) -> Result<SetRecord, String> { with_conn(state, |conn| Ok(sets::remove_track_from_set(conn, set_id, track_id)?)) }

#[tauri::command]
pub async fn reorder_set_tracks(state: tauri::State<'_, AppState>, request: ReorderSetTracksRequest) -> Result<SetRecord, String> { with_conn(state, |conn| Ok(sets::reorder_set_tracks(conn, request)?)) }

#[tauri::command]
pub async fn generate_set_draft(state: tauri::State<'_, AppState>, request: GenerateSetDraftRequest) -> Result<SetDraft, String> { with_conn(state, |conn| Ok(sets::generate_set_draft(conn, request)?)) }

#[tauri::command]
pub async fn export_set_csv(state: tauri::State<'_, AppState>, set_id: i64) -> Result<String, String> { with_conn(state, |conn| Ok(exports::export_set_csv(&sets::get_set(conn, set_id)?))) }

#[tauri::command]
pub async fn export_set_json(state: tauri::State<'_, AppState>, set_id: i64) -> Result<String, String> { with_conn(state, |conn| exports::export_set_json(&sets::get_set(conn, set_id)?)) }

#[tauri::command]
pub async fn export_set_m3u(state: tauri::State<'_, AppState>, set_id: i64) -> Result<String, String> { with_conn(state, |conn| Ok(exports::export_set_m3u(&sets::get_set(conn, set_id)?))) }

#[tauri::command]
pub async fn get_settings(state: tauri::State<'_, AppState>) -> Result<serde_json::Value, String> {
    with_conn(state, |conn| {
        let mut stmt = conn.prepare("SELECT key, value FROM app_settings")?;
        let pairs = stmt.query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))?.collect::<Result<Vec<_>, _>>()?;
        let mut map = serde_json::Map::new();
        for (key, value) in pairs { map.insert(key, serde_json::from_str(&value).unwrap_or(serde_json::Value::String(value))); }
        Ok(serde_json::Value::Object(map))
    })
}

#[tauri::command]
pub async fn update_settings(state: tauri::State<'_, AppState>, settings: serde_json::Value) -> Result<serde_json::Value, String> {
    with_conn(state, |conn| {
        if let serde_json::Value::Object(map) = settings {
            for (key, value) in map {
                conn.execute("INSERT INTO app_settings(key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value", rusqlite::params![key, value.to_string()])?;
            }
        }
        Ok(serde_json::json!({ "ok": true }))
    })
}
