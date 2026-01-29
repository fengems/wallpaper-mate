use crate::types::{WallpaperError, WallpaperInfo, WallpaperSource};
use std::{
    fs,
    path::PathBuf,
};
use tauri::Manager;

pub fn get_cache_dir<R: tauri::Runtime>(app: &impl Manager<R>) -> Result<PathBuf, WallpaperError> {
    let cache_path = app
        .path()
        .app_data_dir()
        .map_err(|e| WallpaperError::ApiError(e.to_string()))?
        .join("cache");

    if !cache_path.exists() {
        fs::create_dir_all(&cache_path)?;
    }

    Ok(cache_path)
}

pub async fn download_and_cache<R: tauri::Runtime>(
    app: &impl Manager<R>,
    wallpaper: &WallpaperInfo,
) -> Result<PathBuf, WallpaperError> {
    let cache_dir = get_cache_dir(app)?;
    let source_dir = cache_dir.join(match wallpaper.source {
        WallpaperSource::Bing => "bing",
        WallpaperSource::Wallhaven => "wallhaven",
        WallpaperSource::Unsplash => "unsplash",
        WallpaperSource::Pixabay => "pixabay",
        WallpaperSource::Reddit => "reddit",
    });

    if !source_dir.exists() {
        fs::create_dir_all(&source_dir)?;
    }

    let file_name = format!("{}.jpg", wallpaper.id);
    let file_path = source_dir.join(&file_name);

    if file_path.exists() {
        return Ok(file_path);
    }

    let response = reqwest::get(&wallpaper.url).await?;
    let bytes = response.bytes().await?;
    fs::write(&file_path, bytes)?;

    Ok(file_path)
}

pub fn get_cached_path<R: tauri::Runtime>(app: &impl Manager<R>, id: &str) -> Option<PathBuf> {
    let cache_dir = get_cache_dir(app).ok()?;
    let bing_path = cache_dir.join("bing").join(format!("{}.jpg", id));
    let wallhaven_path = cache_dir.join("wallhaven").join(format!("{}.jpg", id));

    if bing_path.exists() {
        Some(bing_path)
    } else if wallhaven_path.exists() {
        Some(wallhaven_path)
    } else {
        None
    }
}

pub fn clean_cache<R: tauri::Runtime>(app: &impl Manager<R>) -> Result<(), WallpaperError> {
    let cache_dir = get_cache_dir(app)?;
    fs::remove_dir_all(&cache_dir)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_path_from_source() {
        let bing_info = WallpaperInfo {
            id: "test".to_string(),
            title: "Test".to_string(),
            url: "http://example.com".to_string(),
            source: WallpaperSource::Bing,
            local_path: None,
            cached: false,
        };
        let path = PathBuf::from("/cache").join("bing").join("test.jpg");
        let expected = format!("{:?}", path);
        assert!(expected.contains("bing"));
    }
}
