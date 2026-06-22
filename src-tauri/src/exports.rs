use crate::models::SetRecord;

pub fn export_set_csv(set: &SetRecord) -> String {
    let mut rows = vec!["position,artist,title,bpm,key,energy,path".to_string()];
    for set_track in &set.tracks {
        if let Some(track) = &set_track.track {
            rows.push(format!(
                "{},{},{},{},{},{},{}",
                set_track.position,
                csv_escape(track.artist.as_deref().unwrap_or("")),
                csv_escape(track.title.as_deref().unwrap_or(&track.file_name)),
                track.bpm.map(|value| value.to_string()).unwrap_or_default(),
                csv_escape(track.camelot.as_deref().or(track.musical_key.as_deref()).unwrap_or("")),
                track.energy_score.map(|value| value.to_string()).unwrap_or_default(),
                csv_escape(&track.file_path),
            ));
        }
    }
    rows.join("\n")
}

pub fn export_set_json(set: &SetRecord) -> anyhow::Result<String> {
    Ok(serde_json::to_string_pretty(set)?)
}

pub fn export_set_m3u(set: &SetRecord) -> String {
    let mut lines = vec!["#EXTM3U".to_string()];
    for set_track in &set.tracks {
        if let Some(track) = &set_track.track {
            let artist = track.artist.as_deref().unwrap_or("Unknown Artist");
            let title = track.title.as_deref().unwrap_or(&track.file_name);
            let duration = track.duration_seconds.unwrap_or(-1.0).round() as i64;
            lines.push(format!("#EXTINF:{duration},{artist} - {title}"));
            lines.push(track.file_path.clone());
        }
    }
    lines.join("\n")
}

fn csv_escape(value: &str) -> String {
    if value.contains(',') || value.contains('"') || value.contains('\n') {
        format!("\"{}\"", value.replace('"', "\"\""))
    } else {
        value.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{SetRecord, SetTrackRecord, Track};

    #[test]
    fn exports_csv_and_m3u() {
        let set = test_set();
        assert!(export_set_csv(&set).contains("position,artist,title"));
        assert!(export_set_m3u(&set).contains("#EXTM3U"));
    }

    #[test]
    fn exports_json() {
        let json = export_set_json(&test_set()).unwrap();
        assert!(json.contains("Test Set"));
    }

    fn test_set() -> SetRecord {
        SetRecord {
            id: 1,
            name: "Test Set".to_string(),
            description: None,
            context: None,
            duration_target_minutes: None,
            energy_arc: None,
            bpm_min: None,
            bpm_max: None,
            notes: None,
            tracks: vec![SetTrackRecord {
                id: 1,
                set_id: 1,
                track_id: 1,
                position: 1,
                locked: false,
                transition_note: None,
                transition_score: None,
                track: Some(Track {
                    id: 1,
                    source_id: None,
                    file_path: "/music/a.wav".to_string(),
                    file_name: "a.wav".to_string(),
                    file_hash: "hash".to_string(),
                    title: Some("Track".to_string()),
                    artist: Some("Artist".to_string()),
                    album: None,
                    genre: None,
                    year: None,
                    duration_seconds: Some(360.0),
                    sample_rate: None,
                    bitrate: None,
                    format: None,
                    file_size: 0,
                    modified_at: None,
                    artwork_path: None,
                    bpm: Some(130.0),
                    bpm_confidence: None,
                    bpm_source: None,
                    musical_key: None,
                    mode: None,
                    camelot: Some("8A".to_string()),
                    key_source: None,
                    energy_score: Some(0.8),
                    energy_source: None,
                    analysis_status: "done".to_string(),
                    rating: Some(4),
                    notes: None,
                    tags: Vec::new(),
                    free_tags: Vec::new(),
                }),
            }],
        }
    }
}
