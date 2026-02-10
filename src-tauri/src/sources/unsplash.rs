use crate::types::{WallpaperInfo, WallpaperListItem, WallpaperSource};
use serde::Deserialize;

use crate::config::UNSPLASH_ACCESS_KEY;

const UNSPLASH_API_URL: &str = "https://api.unsplash.com";

#[derive(Debug, Deserialize)]
struct UnsplashPhoto {
    id: String,
    width: u32,
    height: u32,
    urls: UnsplashUrls,
    user: UnsplashUser,
}

#[derive(Debug, Deserialize)]
struct UnsplashUrls {
    regular: String,
    small: String,
}

#[derive(Debug, Deserialize)]
struct UnsplashUser {
    name: String,
}

#[derive(Debug, Deserialize)]
struct UnsplashResponse {
    results: Vec<UnsplashPhoto>,
    total: u32,
    #[serde(rename = "total_pages")]
    total_pages: u32,
}

pub struct UnsplashConfig {
    pub query: Option<String>,
    pub orientation: Option<String>,
    pub access_key: Option<String>,
}

impl Default for UnsplashConfig {
    fn default() -> Self {
        Self {
            query: Some("wallpaper".to_string()),
            orientation: Some("landscape".to_string()),
            access_key: None,
        }
    }
}

pub async fn fetch_wallpapers(
    config: Option<UnsplashConfig>,
) -> Result<Vec<WallpaperInfo>, Box<dyn std::error::Error + Send + Sync>> {
    let config = config.unwrap_or_default();
    let client = reqwest::Client::new();

    let mut url = reqwest::Url::parse(&format!("{}/search/photos", UNSPLASH_API_URL))?;
    url.query_pairs_mut()
        .append_pair("query", config.query.as_deref().unwrap_or("wallpaper"))
        .append_pair("orientation", config.orientation.as_deref().unwrap_or("landscape"))
        .append_pair("per_page", "20");

    let auth_header = format!("Client-ID {}", UNSPLASH_ACCESS_KEY);

    let response = client
        .get(url)
        .header("Authorization", auth_header)
        .send()
        .await?;

    let unsplash_response: UnsplashResponse = response.json().await?;

    let wallpapers = unsplash_response
        .results
        .into_iter()
        .filter(|photo| photo.width >= 1920 && photo.height >= 1080)
        .map(|photo| {
            WallpaperInfo {
                id: photo.id.clone(),
                title: format!("Photo by {}", photo.user.name),
                url: photo.urls.regular.clone(),
                source: WallpaperSource::Unsplash,
                local_path: None,
                cached: false,
            }
        })
        .collect();

    Ok(wallpapers)
}

pub async fn fetch_wallpapers_paginated(
    config: Option<UnsplashConfig>,
    page: u32,
) -> Result<crate::types::PaginatedResponse<WallpaperListItem>, Box<dyn std::error::Error + Send + Sync>> {
    use crate::types::{PaginatedResponse, WallpaperListItem};

    let config = config.unwrap_or_default();
    let client = reqwest::Client::new();

    let mut url = reqwest::Url::parse(&format!("{}/search/photos", UNSPLASH_API_URL))?;
    url.query_pairs_mut()
        .append_pair("query", config.query.as_deref().unwrap_or("wallpaper"))
        .append_pair("orientation", config.orientation.as_deref().unwrap_or("landscape"))
        .append_pair("per_page", "20")
        .append_pair("page", &page.to_string());

    let auth_header = config
        .access_key
        .as_ref()
        .map(|k| format!("Client-ID {}", k))
        .unwrap_or_else(|| {
            format!("Client-ID {}", UNSPLASH_ACCESS_KEY)
        });

    let response = client
        .get(url)
        .header("Authorization", auth_header)
        .send()
        .await?;

    let unsplash_response: UnsplashResponse = response.json().await?;

    let wallpapers: Vec<WallpaperListItem> = unsplash_response
        .results
        .into_iter()
        .filter(|photo| photo.width >= 1920 && photo.height >= 1080)
        .map(|photo| {
            WallpaperListItem {
                id: photo.id.clone(),
                title: format!("Photo by {}", photo.user.name),
                url: photo.urls.regular.clone(),
                source: WallpaperSource::Unsplash,
                thumb_url: photo.urls.small.clone(),
            }
        })
        .collect();

    Ok(PaginatedResponse {
        data: wallpapers,
        current_page: page,
        last_page: unsplash_response.total_pages,
        per_page: 20,
        total: unsplash_response.total,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = UnsplashConfig::default();
        assert_eq!(config.query, Some("wallpaper".to_string()));
        assert_eq!(config.orientation, Some("landscape".to_string()));
    }
}
