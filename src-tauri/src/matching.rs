use std::collections::HashSet;

use crate::models::{MatchScore, Track, TrackTag};

pub fn bpm_score(a: Option<f64>, b: Option<f64>) -> f64 {
    let (Some(a), Some(b)) = (a, b) else { return 50.0; };
    let diff = (a - b).abs();
    if diff <= 1.0 { 100.0 }
    else if diff <= 2.0 { 90.0 }
    else if diff <= 4.0 { 75.0 }
    else if diff <= 6.0 { 50.0 }
    else if diff <= 8.0 { 25.0 }
    else { 10.0 }
}

pub fn key_score(a: Option<&str>, b: Option<&str>) -> f64 {
    let (Some(a), Some(b)) = (a, b) else { return 50.0; };
    let Some((a_num, a_letter)) = parse_camelot(a) else { return 50.0; };
    let Some((b_num, b_letter)) = parse_camelot(b) else { return 50.0; };

    if a_num == b_num && a_letter == b_letter { 100.0 }
    else if a_letter == b_letter && (a_num == wrap_camelot(b_num - 1) || a_num == wrap_camelot(b_num + 1)) { 90.0 }
    else if a_num == b_num && a_letter != b_letter { 85.0 }
    else { 25.0 }
}

pub fn calculate_match(track_a: &Track, track_b: &Track) -> MatchScore {
    let bpm = bpm_score(track_a.bpm, track_b.bpm);
    let key = key_score(track_a.camelot.as_deref(), track_b.camelot.as_deref());
    let energy = numeric_similarity(track_a.energy_score, track_b.energy_score);
    let mood = tag_similarity(&track_a.tags, &track_b.tags, "mood");
    let function = function_score(primary_tag(&track_a.tags, "function"), primary_tag(&track_b.tags, "function"));
    let groove = tag_similarity(&track_a.tags, &track_b.tags, "groove");
    let spectral = 50.0;
    let history = preference_score(track_b);

    let score = bpm * 0.25 + key * 0.15 + energy * 0.20 + mood * 0.10 + function * 0.10 + groove * 0.10 + spectral * 0.05 + history * 0.05;
    let known = [track_a.bpm, track_b.bpm, track_a.energy_score, track_b.energy_score]
        .iter()
        .filter(|value| value.is_some())
        .count() as f64;
    let confidence = ((known / 4.0) * 0.65 + if track_a.camelot.is_some() && track_b.camelot.is_some() { 0.25 } else { 0.10 } + 0.10).min(1.0);
    let indicator = if score >= 82.0 { "safe" } else if score >= 68.0 { "interesting" } else if score >= 52.0 { "risky" } else { "wildcard" }.to_string();
    let explanation = explain_match(bpm, key, energy, groove, score);

    MatchScore {
        track_a_id: track_a.id,
        track_b_id: track_b.id,
        score: round(score),
        confidence: round(confidence * 100.0),
        bpm_score: bpm,
        key_score: key,
        energy_score: energy,
        mood_score: mood,
        function_score: function,
        groove_score: groove,
        spectral_score: spectral,
        history_score: history,
        explanation,
        indicator,
    }
}

fn parse_camelot(value: &str) -> Option<(i64, char)> {
    let value = value.trim().to_ascii_uppercase();
    let letter = value.chars().last()?;
    let number = value[..value.len().saturating_sub(1)].parse::<i64>().ok()?;
    if (1..=12).contains(&number) && matches!(letter, 'A' | 'B') { Some((number, letter)) } else { None }
}

fn wrap_camelot(value: i64) -> i64 {
    if value < 1 { 12 } else if value > 12 { 1 } else { value }
}

fn numeric_similarity(a: Option<f64>, b: Option<f64>) -> f64 {
    let (Some(a), Some(b)) = (a, b) else { return 50.0; };
    (100.0 - ((a - b).abs() * 20.0)).clamp(20.0, 100.0)
}

fn tag_similarity(a: &[TrackTag], b: &[TrackTag], field: &str) -> f64 {
    let a_values = tag_set(a, field);
    let b_values = tag_set(b, field);
    if a_values.is_empty() || b_values.is_empty() { return 50.0; }
    let intersection = a_values.intersection(&b_values).count() as f64;
    let union = a_values.union(&b_values).count() as f64;
    if union == 0.0 { 50.0 } else { (intersection / union) * 100.0 }
}

fn tag_set(tags: &[TrackTag], field: &str) -> HashSet<String> {
    tags.iter()
        .filter(|tag| tag.field == field)
        .map(|tag| tag.value.to_ascii_lowercase())
        .collect()
}

fn primary_tag<'a>(tags: &'a [TrackTag], field: &str) -> Option<&'a str> {
    tags.iter().find(|tag| tag.field == field).map(|tag| tag.value.as_str())
}

fn function_score(a: Option<&str>, b: Option<&str>) -> f64 {
    match (a, b) {
        (Some("opener"), Some("builder")) => 100.0,
        (Some("builder"), Some("roller")) => 100.0,
        (Some("roller"), Some("peak-time")) => 95.0,
        (Some("peak-time"), Some("reset" | "bridge")) => 85.0,
        (Some("reset"), Some("builder")) => 90.0,
        (Some("tool"), Some(_)) => 85.0,
        (Some(a), Some(b)) if a == b => 80.0,
        (Some(_), Some(_)) => 50.0,
        _ => 50.0,
    }
}

fn preference_score(track: &Track) -> f64 {
    let rating = track.rating.unwrap_or(3).clamp(1, 5) as f64;
    let favorite_bonus = if track.tags.iter().any(|tag| tag.field == "status" && tag.value == "favorite") { 15.0 } else { 0.0 };
    (rating * 15.0 + 20.0 + favorite_bonus).min(100.0)
}

fn explain_match(bpm: f64, key: f64, energy: f64, groove: f64, total: f64) -> String {
    let prefix = if total >= 75.0 { "Buen match" } else { "Match arriesgado" };
    let mut reasons = Vec::new();
    if bpm >= 90.0 { reasons.push("BPM muy cercano"); }
    else if bpm < 50.0 { reasons.push("salto de BPM importante"); }
    if key >= 85.0 { reasons.push("tonalidad compatible"); }
    else if key <= 25.0 { reasons.push("tonalidad tensa"); }
    if energy >= 80.0 { reasons.push("energia coherente"); }
    if groove >= 80.0 { reasons.push("groove similar"); }

    if reasons.is_empty() {
        format!("{prefix}: compatibilidad media con datos incompletos; revisar energia y tonalidad antes de usarlo.")
    } else {
        format!("{prefix}: {}.", reasons.join(", "))
    }
}

fn round(value: f64) -> f64 {
    (value * 10.0).round() / 10.0
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::Track;

    #[test]
    fn scores_bpm_with_techno_thresholds() {
        assert_eq!(bpm_score(Some(130.0), Some(131.0)), 100.0);
        assert_eq!(bpm_score(Some(130.0), Some(134.0)), 75.0);
        assert_eq!(bpm_score(Some(130.0), Some(139.0)), 10.0);
    }

    #[test]
    fn scores_camelot_compatibility() {
        assert_eq!(key_score(Some("8A"), Some("8A")), 100.0);
        assert_eq!(key_score(Some("8A"), Some("9A")), 90.0);
        assert_eq!(key_score(Some("8A"), Some("8B")), 85.0);
        assert_eq!(key_score(Some("8A"), Some("2B")), 25.0);
    }

    #[test]
    fn calculates_explainable_match() {
        let a = test_track(1, Some(130.0), Some("8A"), Some(0.7));
        let b = test_track(2, Some(131.0), Some("9A"), Some(0.75));
        let score = calculate_match(&a, &b);
        assert!(score.score > 70.0);
        assert!(score.explanation.contains("BPM"));
    }

    fn test_track(id: i64, bpm: Option<f64>, camelot: Option<&str>, energy: Option<f64>) -> Track {
        Track {
            id,
            source_id: None,
            file_path: String::new(),
            file_name: String::new(),
            file_hash: String::new(),
            title: None,
            artist: None,
            album: None,
            genre: None,
            year: None,
            duration_seconds: None,
            sample_rate: None,
            bitrate: None,
            format: None,
            file_size: 0,
            modified_at: None,
            artwork_path: None,
            bpm,
            bpm_confidence: None,
            bpm_source: bpm.map(|_| "manual".to_string()),
            musical_key: None,
            mode: None,
            camelot: camelot.map(str::to_string),
            key_source: camelot.map(|_| "manual".to_string()),
            energy_score: energy,
            energy_source: energy.map(|_| "manual".to_string()),
            analysis_status: "done".to_string(),
            rating: Some(4),
            notes: None,
            tags: vec![TrackTag { field: "mood".to_string(), value: "dark".to_string() }],
            free_tags: Vec::new(),
        }
    }
}
