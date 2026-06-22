use sha2::{Digest, Sha256};
use std::{fs::File, io::Read, path::{Path, PathBuf}};
use walkdir::WalkDir;

pub const ALLOWED_AUDIO_FORMATS: [&str; 7] = ["mp3", "wav", "aiff", "aif", "flac", "m4a", "ogg"];

#[derive(Debug, Clone)]
pub struct AudioFileCandidate {
    pub path: PathBuf,
    pub extension: String,
}

pub fn is_supported_audio_file(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| ALLOWED_AUDIO_FORMATS.contains(&extension.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
}

pub fn scan_audio_files(root: &Path, recursive: bool) -> Vec<AudioFileCandidate> {
    let walker = if recursive {
        WalkDir::new(root)
    } else {
        WalkDir::new(root).max_depth(1)
    };

    walker
        .into_iter()
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file() && is_supported_audio_file(entry.path()))
        .filter_map(|entry| {
            let extension = entry.path().extension()?.to_str()?.to_ascii_lowercase();
            Some(AudioFileCandidate { path: entry.path().to_path_buf(), extension })
        })
        .collect()
}

pub fn hash_file(path: &Path) -> anyhow::Result<String> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 64 * 1024];

    loop {
        let read = file.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
    }

    Ok(hex::encode(hasher.finalize()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_supported_audio_formats_case_insensitively() {
        assert!(is_supported_audio_file(Path::new("track.MP3")));
        assert!(is_supported_audio_file(Path::new("track.aiff")));
        assert!(is_supported_audio_file(Path::new("track.m4a")));
        assert!(!is_supported_audio_file(Path::new("cover.jpg")));
    }
}
