use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WallpaperInfo {
    pub id: String,
    pub title: String,
    pub url: String,
    pub source: WallpaperSource,
    pub local_path: Option<PathBuf>,
    pub cached: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum WallpaperSource {
    Bing,
    Wallhaven,
}

#[derive(Debug, thiserror::Error)]
pub enum WallpaperError {
    #[error("Network error: {0}")]
    NetworkError(#[from] reqwest::Error),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Serde error: {0}")]
    SerdeError(#[from] serde_json::Error),

    #[error("Wallpaper crate error: {0}")]
    WallpaperError(String),

    #[error("API error: {0}")]
    ApiError(String),
}
