use crate::types::WallpaperError;
use std::path::Path;

pub fn set_wallpaper(path: &Path) -> Result<(), WallpaperError> {
    wallpaper::set_from_path(path.to_str().unwrap())
        .map_err(|e| WallpaperError::WallpaperError(e.to_string()))
}

pub fn get_current_wallpaper() -> Result<String, WallpaperError> {
    wallpaper::get()
        .map_err(|e| WallpaperError::WallpaperError(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_set_wallpaper_file_not_found() {
        let non_existent_path = std::path::Path::new("/tmp/non_existent_file.jpg");
        let result = set_wallpaper(non_existent_path);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_current_wallpaper() {
        let result = get_current_wallpaper();
        assert!(result.is_ok());
    }
}

