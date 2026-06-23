use rusqlite::{params, Connection};

use crate::{db::{get_track, list_tracks, now}, matching::calculate_match, models::*};

pub fn create_set(conn: &Connection, request: CreateSetRequest) -> rusqlite::Result<SetRecord> {
    conn.execute(
        "INSERT INTO sets(name, description, context, duration_target_minutes, energy_arc, bpm_min, bpm_max, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)",
        params![request.name, request.description, request.context, request.duration_target_minutes, request.energy_arc, request.bpm_min, request.bpm_max, request.notes, now()],
    )?;
    get_set(conn, conn.last_insert_rowid())
}

pub fn update_set(conn: &Connection, set_id: i64, request: CreateSetRequest) -> rusqlite::Result<SetRecord> {
    conn.execute(
        "UPDATE sets SET name = ?1, description = ?2, context = ?3, duration_target_minutes = ?4, energy_arc = ?5, bpm_min = ?6, bpm_max = ?7, notes = ?8, updated_at = ?9 WHERE id = ?10",
        params![request.name, request.description, request.context, request.duration_target_minutes, request.energy_arc, request.bpm_min, request.bpm_max, request.notes, now(), set_id],
    )?;
    get_set(conn, set_id)
}

pub fn delete_set(conn: &Connection, set_id: i64) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM sets WHERE id = ?1", [set_id])?;
    Ok(())
}

pub fn list_sets(conn: &Connection) -> rusqlite::Result<Vec<SetRecord>> {
    let mut stmt = conn.prepare("SELECT id FROM sets ORDER BY updated_at DESC")?;
    let ids = stmt.query_map([], |row| row.get::<_, i64>(0))?.collect::<Result<Vec<_>, _>>()?;
    ids.into_iter().map(|id| get_set(conn, id)).collect()
}

pub fn get_set(conn: &Connection, set_id: i64) -> rusqlite::Result<SetRecord> {
    let mut set = conn.query_row(
        "SELECT id, name, description, context, duration_target_minutes, energy_arc, bpm_min, bpm_max, notes FROM sets WHERE id = ?1",
        [set_id],
        |row| Ok(SetRecord {
            id: row.get(0)?, name: row.get(1)?, description: row.get(2)?, context: row.get(3)?, duration_target_minutes: row.get(4)?,
            energy_arc: row.get(5)?, bpm_min: row.get(6)?, bpm_max: row.get(7)?, notes: row.get(8)?, tracks: Vec::new(),
        }),
    )?;
    set.tracks = list_set_tracks(conn, set_id)?;
    Ok(set)
}

pub fn add_track_to_set(conn: &Connection, request: AddTrackToSetRequest) -> rusqlite::Result<SetRecord> {
    let position = conn.query_row("SELECT COALESCE(MAX(position), 0) + 1 FROM set_tracks WHERE set_id = ?1", [request.set_id], |row| row.get::<_, i64>(0))?;
    conn.execute(
        "INSERT OR IGNORE INTO set_tracks(set_id, track_id, position, locked, created_at, updated_at) VALUES (?1, ?2, ?3, 0, ?4, ?4)",
        params![request.set_id, request.track_id, position, now()],
    )?;
    get_set(conn, request.set_id)
}

pub fn remove_track_from_set(conn: &Connection, set_id: i64, track_id: i64) -> rusqlite::Result<SetRecord> {
    conn.execute("DELETE FROM set_tracks WHERE set_id = ?1 AND track_id = ?2", params![set_id, track_id])?;
    normalize_positions(conn, set_id)?;
    get_set(conn, set_id)
}

pub fn reorder_set_tracks(conn: &Connection, request: ReorderSetTracksRequest) -> rusqlite::Result<SetRecord> {
    for (index, track_id) in request.track_ids.iter().enumerate() {
        conn.execute("UPDATE set_tracks SET position = ?1, updated_at = ?2 WHERE set_id = ?3 AND track_id = ?4", params![(index + 1) as i64, now(), request.set_id, track_id])?;
    }
    get_set(conn, request.set_id)
}

pub fn generate_set_draft(conn: &Connection, request: GenerateSetDraftRequest) -> rusqlite::Result<SetDraft> {
    let filters = TrackFilters { bpm_min: request.bpm_min, bpm_max: request.bpm_max, status: Some("done".to_string()), limit: Some(1000), offset: Some(0), ..TrackFilters::default() };
    let mut tracks = list_tracks(conn, filters)?.tracks;
    tracks.retain(|track| !request.excluded_track_ids.contains(&track.id));
    tracks.retain(|track| !track.tags.iter().any(|tag| tag.field == "status" && tag.value == "discarded"));
    if let Some(mood) = &request.mood {
        tracks.sort_by_key(|track| if track.tags.iter().any(|tag| tag.field == "mood" && &tag.value == mood) { 0 } else { 1 });
    }
    tracks.sort_by(|a, b| b.rating.unwrap_or(0).cmp(&a.rating.unwrap_or(0)).then_with(|| a.bpm.partial_cmp(&b.bpm).unwrap_or(std::cmp::Ordering::Equal)));

    let mut selected: Vec<Track> = request.required_track_ids.iter().filter_map(|id| get_track(conn, *id).ok()).collect();
    let target_seconds = request.duration_target_minutes.unwrap_or(90) as f64 * 60.0;
    for track in tracks {
        if selected.iter().any(|existing| existing.id == track.id) { continue; }
        if selected_duration(&selected) >= target_seconds { break; }
        if selected.last().map(|previous| calculate_match(previous, &track).score >= 45.0).unwrap_or(true) {
            selected.push(track);
        }
    }

    let total_duration_minutes = selected_duration(&selected) / 60.0;
    let mut warnings = Vec::new();
    if total_duration_minutes < request.duration_target_minutes.unwrap_or(90) as f64 * 0.8 {
        warnings.push("No hay suficientes tracks analizados para alcanzar la duracion objetivo.".to_string());
    }
    Ok(SetDraft {
        name: request.name,
        tracks: selected,
        total_duration_minutes,
        warnings,
        explanation: "Borrador generado priorizando BPM, rating, tags compatibles y evitando descartados.".to_string(),
    })
}

fn list_set_tracks(conn: &Connection, set_id: i64) -> rusqlite::Result<Vec<SetTrackRecord>> {
    let mut stmt = conn.prepare("SELECT id, set_id, track_id, position, locked, transition_note, transition_score FROM set_tracks WHERE set_id = ?1 ORDER BY position")?;
    let tracks = stmt.query_map([set_id], |row| {
        let track_id = row.get(2)?;
        Ok(SetTrackRecord {
            id: row.get(0)?, set_id: row.get(1)?, track_id, position: row.get(3)?, locked: row.get(4)?, transition_note: row.get(5)?, transition_score: row.get(6)?, track: get_track(conn, track_id).ok(),
        })
    })?.collect();
    tracks
}

fn normalize_positions(conn: &Connection, set_id: i64) -> rusqlite::Result<()> {
    let tracks = list_set_tracks(conn, set_id)?;
    for (index, track) in tracks.iter().enumerate() {
        conn.execute("UPDATE set_tracks SET position = ?1 WHERE id = ?2", params![(index + 1) as i64, track.id])?;
    }
    Ok(())
}

fn selected_duration(tracks: &[Track]) -> f64 {
    tracks.iter().map(|track| track.duration_seconds.unwrap_or(360.0)).sum()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::migrate;

    #[test]
    fn generates_set_draft_from_done_tracks() {
        let conn = Connection::open_in_memory().unwrap();
        migrate(&conn).unwrap();
        for i in 1..=3 {
            conn.execute("INSERT INTO tracks(file_path, file_name, file_hash, file_size, duration_seconds, created_at, updated_at) VALUES (?1, ?2, ?3, 10, 360, 'now', 'now')", params![format!("/{i}.mp3"), format!("{i}.mp3"), format!("hash{i}")]).unwrap();
            let track_id = conn.last_insert_rowid();
            conn.execute("INSERT INTO track_analysis(track_id, analysis_version, status, bpm, energy_score, created_at, updated_at) VALUES (?1, 1, 'done', 130, 0.7, 'now', 'now')", [track_id]).unwrap();
        }
        let draft = generate_set_draft(&conn, GenerateSetDraftRequest { name: "Draft".to_string(), duration_target_minutes: Some(10), bpm_min: Some(128.0), bpm_max: Some(134.0), mood: None, energy_arc: None, required_track_ids: Vec::new(), excluded_track_ids: Vec::new() }).unwrap();
        assert!(!draft.tracks.is_empty());
    }
}
