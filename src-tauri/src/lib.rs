mod commands;
mod db;
mod exports;
mod matching;
mod metadata;
mod models;
mod scanner;
mod sets;

use commands::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let db_path = db::database_path(&app.handle())?;
            let conn = db::connect(&db_path)?;
            db::migrate(&conn)?;
            app.manage(AppState { db_path: std::sync::Mutex::new(db_path) });
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::select_music_folder,
            commands::add_source,
            commands::scan_source,
            commands::rescan_source,
            commands::list_tracks,
            commands::get_track,
            commands::update_track_tags,
            commands::update_track_rating,
            commands::update_track_notes,
            commands::analyze_track,
            commands::analyze_tracks_batch,
            commands::get_analysis_queue_status,
            commands::find_matches_for_track,
            commands::create_set,
            commands::update_set,
            commands::delete_set,
            commands::list_sets,
            commands::add_track_to_set,
            commands::remove_track_from_set,
            commands::reorder_set_tracks,
            commands::generate_set_draft,
            commands::export_set_csv,
            commands::export_set_json,
            commands::export_set_m3u,
            commands::get_settings,
            commands::update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
