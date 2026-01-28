use crate::services::{cache, wallpaper};
use crate::types::{WallpaperInfo, WallpaperSource, WallpaperError};
use tauri::{AppHandle, Emitter, Manager};

#[tauri::command]
pub async fn fetch_next_wallpaper(
    app: AppHandle,
    source: String,
) -> Result<WallpaperInfo, String> {
    let wallpaper_source = match source.as_str() {
        "bing" => WallpaperSource::Bing,
        "wallhaven" => WallpaperSource::Wallhaven,
        _ => {
            return Err("Invalid source".to_string());
        }
    };

    let wallpapers = match wallpaper_source {
        WallpaperSource::Bing => {
            crate::sources::bing::fetch_wallpapers()
                .await
                .map_err(|e| format!("Bing API error: {}", e))?
        }
        WallpaperSource::Wallhaven => {
            crate::sources::wallhaven::search_wallpapers(None)
                .await
                .map_err(|e| format!("Wallhaven API error: {}", e))?
        }
    };

    if wallpapers.is_empty() {
        return Err("No wallpapers found".to_string());
    }

    let selected = &wallpapers[0];
    let cached_path = cache::download_and_cache(&app, selected)
        .await
        .map_err(|e| format!("Cache error: {}", e))?;

    app.emit("wallpaper-fetched", &selected)
        .map_err(|e| format!("Emit error: {}", e))?;

    Ok(WallpaperInfo {
        id: selected.id.clone(),
        title: selected.title.clone(),
        url: selected.url.clone(),
        source: selected.source.clone(),
        local_path: Some(cached_path),
        cached: true,
    })
}

#[tauri::command]
pub async fn set_wallpaper_from_info(
    app: AppHandle,
    wallpaper: WallpaperInfo,
) -> Result<(), String> {
    let path = wallpaper
        .local_path
        .ok_or("Wallpaper not cached".to_string())?;

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

    Ok(path.to_string_lossy().to_string())
}
