use crate::services::{cache, wallpaper, scheduler};
use crate::types::{PaginatedResponse, WallpaperInfo, WallpaperListItem, WallpaperSource};
use crate::sources::provider::{fetch_paginated, fetch_random, ProviderError};

use tauri::{AppHandle, Emitter};
use rand::prelude::IndexedRandom;

impl WallpaperSource {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "bing" => Some(WallpaperSource::Bing),
            "wallhaven" => Some(WallpaperSource::Wallhaven),
            "unsplash" => Some(WallpaperSource::Unsplash),
            "pixabay" => Some(WallpaperSource::Pixabay),
            "pexels" => Some(WallpaperSource::Pexels),
            "reddit" => Some(WallpaperSource::Reddit),
            _ => None,
        }
    }
}

impl From<ProviderError> for String {
    fn from(err: ProviderError) -> Self {
        err.to_string()
    }
}

#[tauri::command]
pub async fn fetch_next_wallpaper(
    app: AppHandle,
    source: String,
    api_key: Option<String>,
) -> Result<WallpaperInfo, String> {
    let wallpaper_source = WallpaperSource::from_str(&source)
        .ok_or("Invalid source".to_string())?;

    let wallpapers = fetch_random(wallpaper_source.clone(), api_key.clone()).await
        .map_err(|e| e.to_string())?;

    if wallpapers.is_empty() {
        return Err("No wallpapers found".to_string());
    }

    let mut selected = wallpapers.choose(&mut rand::rng())
        .ok_or("Failed to select wallpaper".to_string())?
        .clone();

    if let WallpaperSource::Wallhaven = wallpaper_source {
        if let Ok(tags) = crate::sources::wallhaven::get_wallpaper_details(&selected.id, api_key).await {
            if !tags.is_empty() {
                let title_tags = tags.iter().take(3).cloned().collect::<Vec<_>>().join(", ");
                let resolution = selected.title.split('(').nth(1)
                    .map(|s| format!("({})", s.trim_end_matches(')')))
                    .unwrap_or_default();
                selected.title = format!("{} {}", title_tags, resolution);

                if let Some(c) = selected.title.get_mut(0..1) {
                    c.make_ascii_uppercase();
                }
            }
        }
    }

    let cached_path = cache::download_and_cache(&app, &selected)
        .await
        .map_err(|e| format!("Cache error: {}", e))?;

    let result_info = WallpaperInfo {
        id: selected.id.clone(),
        title: selected.title.clone(),
        url: selected.url.clone(),
        source: selected.source.clone(),
        local_path: Some(cached_path),
        cached: true,
    };

    app.emit("wallpaper-fetched", &result_info)
        .map_err(|e| format!("Emit error: {}", e))?;

    Ok(result_info)
}

#[tauri::command]
pub async fn set_wallpaper_from_info(
    app: AppHandle,
    wallpaper: WallpaperInfo,
) -> Result<(), String> {
    let path = if let Some(cached_path) = wallpaper.local_path {
        cached_path
    } else {
        cache::download_and_cache(&app, &wallpaper)
            .await
            .map_err(|e| format!("Cache error: {}", e))?
    };

    wallpaper::set_wallpaper(&path)
        .map_err(|e| format!("Set wallpaper error: {}", e))?;

    app.emit("wallpaper-set", &path)
        .map_err(|e| format!("Emit error: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_current_wallpaper_path() -> Result<String, String> {
    let path = wallpaper::get_current_wallpaper()
        .map_err(|e| format!("Get wallpaper error: {}", e))?;

    Ok(path)
}

#[tauri::command]
pub async fn fetch_wallpapers_list(
    source: String,
    page: u32,
    api_key: Option<String>,
) -> Result<PaginatedResponse<WallpaperListItem>, String> {
    let wallpaper_source = WallpaperSource::from_str(&source)
        .ok_or("Invalid source".to_string())?;

    fetch_paginated(wallpaper_source, api_key, page).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn download_wallpaper(
    app: AppHandle,
    wallpaper: WallpaperInfo,
) -> Result<String, String> {
    let cached_path = cache::download_and_cache(&app, &wallpaper)
        .await
        .map_err(|e| format!("Cache error: {}", e))?;

    Ok(cached_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn set_auto_switch_config(
    source: String,
    enabled: bool,
    interval_seconds: u64,
) -> Result<(), String> {
    let config = scheduler::AutoSwitchConfig {
        enabled,
        interval_seconds,
    };
    scheduler::get_scheduler().set_config(&source, config);
    Ok(())
}

#[tauri::command]
pub fn get_auto_switch_config(source: String) -> Option<scheduler::AutoSwitchConfig> {
    scheduler::get_scheduler().get_config(&source)
}

#[tauri::command]
pub fn list_downloads(app: AppHandle) -> Result<Vec<(String, String)>, String> {
    let files = cache::list_cached_files(&app)
        .map_err(|e| format!("Failed to list downloads: {}", e))?;
    
    Ok(files.into_iter()
        .map(|(id, path)| (id, path.to_string_lossy().to_string()))
        .collect())
}

#[tauri::command]
pub fn delete_download(app: AppHandle, id: String) -> Result<bool, String> {
    cache::delete_cached_file(&app, &id)
        .map_err(|e| format!("Failed to delete download: {}", e))
}

#[tauri::command]
pub fn reveal_in_finder(path: String) -> Result<(), String> {
    let path_buf = std::path::PathBuf::from(path);
    cache::reveal_in_finder(&path_buf)
        .map_err(|e| format!("Failed to reveal in finder: {}", e))
}
