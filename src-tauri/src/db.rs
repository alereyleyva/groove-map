use std::path::{Path, PathBuf};

use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension};
use tauri::Manager;

use crate::{metadata::read_audio_metadata, models::*, scanner::{hash_file, scan_audio_files}};

const MIGRATIONS: [&str; 1] = [include_str!("migrations/001_initial.sql")];

pub fn database_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    Ok(dir.join("groove-map.sqlite"))
}

pub fn connect(path: &Path) -> rusqlite::Result<Connection> {
    let conn = Connection::open(path)?;
    conn.pragma_update(None, "foreign_keys", "ON")?;
    Ok(conn)
}

pub fn migrate(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch("CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY);")?;
    for (index, migration) in MIGRATIONS.iter().enumerate() {
        let version = (index + 1) as i64;
        let exists: Option<i64> = conn.query_row(
            "SELECT version FROM schema_migrations WHERE version = ?1",
            [version],
            |row| row.get(0),
        ).optional()?;
        if exists.is_none() {
            conn.execute_batch(migration)?;
            conn.execute("INSERT INTO schema_migrations(version) VALUES (?1)", [version])?;
        }
    }
    Ok(())
}

pub fn add_source(conn: &Connection, request: AddSourceRequest) -> rusqlite::Result<Source> {
    let now = now();
    let name = Path::new(&request.path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(&request.path)
        .to_string();
    conn.execute(
        "INSERT INTO sources(path, name, recursive, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)
         ON CONFLICT(path) DO UPDATE SET recursive = excluded.recursive, updated_at = excluded.updated_at",
        params![request.path, name, request.recursive, now],
    )?;
    let id = conn.query_row("SELECT id FROM sources WHERE path = ?1", [request.path], |row| row.get(0))?;
    get_source(conn, id)
}

pub fn get_source(conn: &Connection, id: i64) -> rusqlite::Result<Source> {
    conn.query_row(
        "SELECT id, path, name, recursive, created_at, updated_at, last_scan_at FROM sources WHERE id = ?1",
        [id],
        |row| Ok(Source {
            id: row.get(0)?,
            path: row.get(1)?,
            name: row.get(2)?,
            recursive: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
            last_scan_at: row.get(6)?,
        }),
    )
}

pub fn scan_source(conn: &Connection, source_id: i64) -> rusqlite::Result<ScanResult> {
    let source = get_source(conn, source_id)?;
    let candidates = scan_audio_files(Path::new(&source.path), source.recursive);
    let mut tracks_imported = 0;
    let mut skipped = 0;
    let mut errors = Vec::new();

    for candidate in &candidates {
        match import_candidate(conn, source_id, candidate.path.as_path(), &candidate.extension) {
            Ok(true) => tracks_imported += 1,
            Ok(false) => skipped += 1,
            Err(error) => errors.push(format!("{}: {error}", candidate.path.display())),
        }
    }
    conn.execute("UPDATE sources SET last_scan_at = ?1, updated_at = ?1 WHERE id = ?2", params![now(), source_id])?;
    Ok(ScanResult { source_id, files_found: candidates.len(), tracks_imported, skipped, errors })
}

fn import_candidate(conn: &Connection, source_id: i64, path: &Path, extension: &str) -> anyhow::Result<bool> {
    let path_text = path.to_string_lossy().to_string();
    let exists: Option<i64> = conn.query_row("SELECT id FROM tracks WHERE file_path = ?1", [&path_text], |row| row.get(0)).optional()?;
    if exists.is_some() {
        return Ok(false);
    }

    let metadata = read_audio_metadata(path);
    let hash = hash_file(path)?;
    let file_name = path.file_name().and_then(|name| name.to_str()).unwrap_or("unknown").to_string();
    let now = now();
    conn.execute(
        "INSERT INTO tracks(source_id, file_path, file_name, file_hash, title, artist, album, genre, year, duration_seconds, sample_rate, bitrate, format, file_size, modified_at, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?16)",
        params![source_id, path_text, file_name, hash, metadata.title, metadata.artist, metadata.album, metadata.genre, metadata.year, metadata.duration_seconds, metadata.sample_rate, metadata.bitrate, extension, metadata.file_size, metadata.modified_at, now],
    )?;
    let track_id = conn.last_insert_rowid();
    conn.execute(
        "INSERT INTO track_analysis(track_id, analysis_version, status, bpm, bpm_confidence, musical_key, camelot, bpm_source, key_source, created_at, updated_at)
         VALUES (?1, 1, 'pending', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8)",
        params![track_id, metadata.bpm, metadata.bpm.map(|_| 0.7_f64), metadata.musical_key, Option::<String>::None, metadata.bpm.map(|_| "metadata"), Option::<String>::None, now],
    )?;
    Ok(true)
}

pub fn list_tracks(conn: &Connection, filters: TrackFilters) -> rusqlite::Result<TrackSummary> {
    let limit = filters.limit.unwrap_or(500).clamp(1, 1000);
    let offset = filters.offset.unwrap_or(0).max(0);
    let search = filters.search.unwrap_or_default();
    let search_pattern = format!("%{}%", search);
    let bpm_min = filters.bpm_min.unwrap_or(0.0);
    let bpm_max = filters.bpm_max.unwrap_or(400.0);
    let status = filters.status.unwrap_or_default();

    let mut stmt = conn.prepare(
        "SELECT COUNT(*) FROM tracks t
         LEFT JOIN track_analysis a ON a.track_id = t.id
         WHERE t.deleted_at IS NULL
           AND (?1 = '' OR t.title LIKE ?2 OR t.artist LIKE ?2 OR t.file_name LIKE ?2)
           AND (a.bpm IS NULL OR a.bpm BETWEEN ?3 AND ?4)
           AND (?5 = '' OR a.status = ?5)",
    )?;
    let total = stmt.query_row(params![search, search_pattern, bpm_min, bpm_max, status], |row| row.get(0))?;

    let mut stmt = conn.prepare(
        "SELECT t.id FROM tracks t
         LEFT JOIN track_analysis a ON a.track_id = t.id
         WHERE t.deleted_at IS NULL
           AND (?1 = '' OR t.title LIKE ?2 OR t.artist LIKE ?2 OR t.file_name LIKE ?2)
           AND (a.bpm IS NULL OR a.bpm BETWEEN ?3 AND ?4)
           AND (?5 = '' OR a.status = ?5)
         ORDER BY COALESCE(t.artist, ''), COALESCE(t.title, t.file_name)
         LIMIT ?6 OFFSET ?7",
    )?;
    let ids = stmt.query_map(params![search, search_pattern, bpm_min, bpm_max, status, limit, offset], |row| row.get::<_, i64>(0))?
        .collect::<Result<Vec<_>, _>>()?;
    let tracks = ids.into_iter().filter_map(|id| get_track(conn, id).ok()).collect();
    Ok(TrackSummary { tracks, total })
}

pub fn get_track(conn: &Connection, id: i64) -> rusqlite::Result<Track> {
    let mut track = conn.query_row(
        "SELECT t.id, t.source_id, t.file_path, t.file_name, t.file_hash, t.title, t.artist, t.album, t.genre, t.year,
                t.duration_seconds, t.sample_rate, t.bitrate, t.format, t.file_size, t.modified_at, t.artwork_path,
                a.bpm, a.bpm_confidence, a.bpm_source, a.musical_key, a.mode, a.camelot, a.key_source,
                a.energy_score, a.energy_source, COALESCE(a.status, 'pending'), r.rating, n.note
         FROM tracks t
         LEFT JOIN track_analysis a ON a.track_id = t.id
         LEFT JOIN track_ratings r ON r.track_id = t.id
         LEFT JOIN track_notes n ON n.track_id = t.id
         WHERE t.id = ?1",
        [id],
        |row| Ok(Track {
            id: row.get(0)?, source_id: row.get(1)?, file_path: row.get(2)?, file_name: row.get(3)?, file_hash: row.get(4)?,
            title: row.get(5)?, artist: row.get(6)?, album: row.get(7)?, genre: row.get(8)?, year: row.get(9)?,
            duration_seconds: row.get(10)?, sample_rate: row.get(11)?, bitrate: row.get(12)?, format: row.get(13)?, file_size: row.get(14)?,
            modified_at: row.get(15)?, artwork_path: row.get(16)?, bpm: row.get(17)?, bpm_confidence: row.get(18)?, bpm_source: row.get(19)?,
            musical_key: row.get(20)?, mode: row.get(21)?, camelot: row.get(22)?, key_source: row.get(23)?, energy_score: row.get(24)?,
            energy_source: row.get(25)?, analysis_status: row.get(26)?, rating: row.get(27)?, notes: row.get(28)?, tags: Vec::new(), free_tags: Vec::new(),
        }),
    )?;
    track.tags = list_tags(conn, id)?;
    track.free_tags = list_free_tags(conn, id)?;
    Ok(track)
}

pub fn update_track_tags(conn: &mut Connection, request: UpdateTagsRequest) -> rusqlite::Result<Track> {
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM track_tags WHERE track_id = ?1", [request.track_id])?;
    tx.execute("DELETE FROM track_free_tags WHERE track_id = ?1", [request.track_id])?;
    for tag in request.structured_tags {
        tx.execute("INSERT INTO track_tags(track_id, field, value, created_at) VALUES (?1, ?2, ?3, ?4)", params![request.track_id, tag.field, tag.value, now()])?;
    }
    for tag in request.free_tags {
        tx.execute("INSERT INTO track_free_tags(track_id, tag, created_at) VALUES (?1, ?2, ?3)", params![request.track_id, tag, now()])?;
    }
    tx.commit()?;
    get_track(conn, request.track_id)
}

pub fn update_track_rating(conn: &Connection, request: UpdateRatingRequest) -> rusqlite::Result<Track> {
    conn.execute(
        "INSERT INTO track_ratings(track_id, rating, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)
         ON CONFLICT(track_id) DO UPDATE SET rating = excluded.rating, updated_at = excluded.updated_at",
        params![request.track_id, request.rating, now()],
    )?;
    get_track(conn, request.track_id)
}

pub fn update_track_notes(conn: &Connection, request: UpdateNotesRequest) -> rusqlite::Result<Track> {
    conn.execute(
        "INSERT INTO track_notes(track_id, note, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)
         ON CONFLICT(track_id) DO UPDATE SET note = excluded.note, updated_at = excluded.updated_at",
        params![request.track_id, request.note, now()],
    )?;
    get_track(conn, request.track_id)
}

pub fn update_manual_analysis(conn: &Connection, request: ManualAnalysisRequest) -> rusqlite::Result<Track> {
    conn.execute(
        "INSERT INTO track_analysis(track_id, analysis_version, status, bpm, bpm_source, musical_key, camelot, key_source, energy_score, energy_source, created_at, updated_at)
         VALUES (?1, 1, 'done', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?9)
         ON CONFLICT(track_id) DO UPDATE SET bpm = COALESCE(excluded.bpm, bpm), bpm_source = CASE WHEN excluded.bpm IS NULL THEN bpm_source ELSE 'manual' END,
             musical_key = COALESCE(excluded.musical_key, musical_key), camelot = COALESCE(excluded.camelot, camelot),
             key_source = CASE WHEN excluded.musical_key IS NULL AND excluded.camelot IS NULL THEN key_source ELSE 'manual' END,
             energy_score = COALESCE(excluded.energy_score, energy_score), energy_source = CASE WHEN excluded.energy_score IS NULL THEN energy_source ELSE 'manual' END,
             status = 'done', updated_at = excluded.updated_at",
        params![request.track_id, request.bpm, request.bpm.map(|_| "manual"), request.musical_key, request.camelot, Some("manual"), request.energy_score, request.energy_score.map(|_| "manual"), now()],
    )?;
    get_track(conn, request.track_id)
}

pub fn queue_status(conn: &Connection) -> rusqlite::Result<QueueStatus> {
    let imported = conn.query_row("SELECT COUNT(*) FROM tracks WHERE deleted_at IS NULL", [], |row| row.get(0))?;
    let count_status = |status: &str| -> rusqlite::Result<i64> {
        conn.query_row("SELECT COUNT(*) FROM track_analysis WHERE status = ?1", [status], |row| row.get(0))
    };
    Ok(QueueStatus { found: imported, imported, pending: count_status("pending")?, analyzing: count_status("analyzing")?, done: count_status("done")?, failed: count_status("failed")?, skipped: count_status("skipped")? })
}

fn list_tags(conn: &Connection, track_id: i64) -> rusqlite::Result<Vec<TrackTag>> {
    let mut stmt = conn.prepare("SELECT field, value FROM track_tags WHERE track_id = ?1 ORDER BY field, value")?;
    let tags = stmt.query_map([track_id], |row| Ok(TrackTag { field: row.get(0)?, value: row.get(1)? }))?.collect();
    tags
}

fn list_free_tags(conn: &Connection, track_id: i64) -> rusqlite::Result<Vec<String>> {
    let mut stmt = conn.prepare("SELECT tag FROM track_free_tags WHERE track_id = ?1 ORDER BY tag")?;
    let tags = stmt.query_map([track_id], |row| row.get(0))?.collect();
    tags
}

pub fn now() -> String {
    Utc::now().to_rfc3339()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn migrates_and_updates_tags() {
        let mut conn = Connection::open_in_memory().unwrap();
        migrate(&conn).unwrap();
        conn.execute("INSERT INTO tracks(file_path, file_name, file_hash, file_size, created_at, updated_at) VALUES ('/a.mp3', 'a.mp3', 'hash', 10, 'now', 'now')", []).unwrap();
        let track_id = conn.last_insert_rowid();
        conn.execute("INSERT INTO track_analysis(track_id, analysis_version, status, created_at, updated_at) VALUES (?1, 1, 'pending', 'now', 'now')", [track_id]).unwrap();

        let track = update_track_tags(&mut conn, UpdateTagsRequest {
            track_id,
            structured_tags: vec![TrackTag { field: "mood".to_string(), value: "dark".to_string() }],
            free_tags: vec!["warehouse".to_string()],
        }).unwrap();

        assert_eq!(track.tags.len(), 1);
        assert_eq!(track.free_tags, vec!["warehouse".to_string()]);
    }
}
