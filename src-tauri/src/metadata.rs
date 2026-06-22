use std::{fs, path::Path, time::UNIX_EPOCH};

use symphonia::core::{formats::{FormatOptions, TrackType}, formats::probe::Hint, io::MediaSourceStream, meta::{MetadataOptions, StandardTag}};

#[derive(Debug, Clone, Default)]
pub struct AudioMetadata {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub genre: Option<String>,
    pub year: Option<i64>,
    pub bpm: Option<f64>,
    pub musical_key: Option<String>,
    pub duration_seconds: Option<f64>,
    pub sample_rate: Option<i64>,
    pub bitrate: Option<i64>,
    pub file_size: i64,
    pub modified_at: Option<String>,
}

pub fn read_audio_metadata(path: &Path) -> AudioMetadata {
    let file_meta = fs::metadata(path).ok();
    let mut metadata = AudioMetadata {
        file_size: file_meta.as_ref().map(|meta| meta.len() as i64).unwrap_or_default(),
        modified_at: file_meta
            .and_then(|meta| meta.modified().ok())
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map(|duration| duration.as_secs().to_string()),
        ..AudioMetadata::default()
    };

    let Ok(file) = fs::File::open(path) else {
        return metadata;
    };

    let mut hint = Hint::new();
    if let Some(extension) = path.extension().and_then(|extension| extension.to_str()) {
        hint.with_extension(extension);
    }

    let Ok(mut format) = symphonia::default::get_probe().probe(
        &hint,
        MediaSourceStream::new(Box::new(file), Default::default()),
        FormatOptions::default(),
        MetadataOptions::default(),
    ) else {
        return metadata;
    };

    if let Some(track) = format.default_track(TrackType::Audio) {
        if let Some(codec_params) = track.codec_params.as_ref() {
            if let Some(audio) = codec_params.audio() {
                metadata.sample_rate = audio.sample_rate.map(i64::from);
            }
        }
        metadata.duration_seconds = match (track.num_frames, metadata.sample_rate) {
            (Some(frames), Some(sample_rate)) if sample_rate > 0 => Some(frames as f64 / sample_rate as f64),
            _ => metadata.duration_seconds,
        };
    }

    if let Some(revision) = format.metadata().current() {
        for tag in &revision.media.tags {
            match tag.std.as_ref() {
                Some(StandardTag::TrackTitle(value)) => metadata.title = Some(value.to_string()),
                Some(StandardTag::Artist(value)) => metadata.artist = Some(value.to_string()),
                Some(StandardTag::Album(value)) => metadata.album = Some(value.to_string()),
                Some(StandardTag::Genre(value)) => metadata.genre = Some(value.to_string()),
                Some(StandardTag::RecordingYear(value)) => metadata.year = Some(i64::from(*value)),
                Some(StandardTag::ReleaseYear(value)) => metadata.year = Some(i64::from(*value)),
                Some(StandardTag::Bpm(value)) => metadata.bpm = Some(*value as f64),
                Some(StandardTag::InitialKey(value)) => metadata.musical_key = Some(value.to_string()),
                _ => {}
            }
        }
    }

    metadata
}
