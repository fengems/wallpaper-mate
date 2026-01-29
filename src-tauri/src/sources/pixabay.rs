use crate::types::{WallpaperInfo, WallpaperListItem, WallpaperSource};
use serde::Deserialize;

const PIXABAY_API_URL: &str = "https://pixabay.com/api";
const PIXABAY_API_KEY: &str = "YOUR_API_KEY";

#[derive(Debug, Deserialize)]
struct PixabayPhoto {
    id: u32,
    #[serde(rename = "pageURL")]
    page_url: String,
    #[serde(rename = "type")]
    photo_type: String,
    tags: String,
    #[serde(rename = "webformatURL")]
    webformat_url: String,
    #[serde(rename = "largeImageURL")]
    large_image_url: String,
    #[serde(rename = "fullHDURL")]
    full_hd_url: String,
    #[serde(rename = "imageWidth")]
    image_width: u32,
    #[serde(rename = "imageHeight")]
    image_height: u32,
    user: String,
}

#[derive(Debug, Deserialize)]
struct PixabayResponse {
    total: u32,
    #[serde(rename = "totalHits")]
    total_hits: u32,
    hits: Vec<PixabayPhoto>,
}

pub struct PixabayConfig {
    pub query: Option<String>,
    pub image_type: Option<String>,
    pub safesearch: Option<bool>,
}

impl Default for PixabayConfig {
    fn default() -> Self {
        Self {
            query: Some("wallpaper".to_string()),
            image_type: Some("photo".to_string()),
            safesearch: Some(true),
        }
    }
}

pub async fn fetch_wallpapers(
    config: Option<PixabayConfig>,
) -> Result<Vec<WallpaperInfo>, Box<dyn std::error::Error + Send + Sync>> {
    let config = config.unwrap_or_default();
    let client = reqwest::Client::new();

    let mut url = reqwest::Url::parse(PIXABAY_API_URL)?;
    url.query_pairs_mut()
        .append_pair("key", PIXABAY_API_KEY)
        .append_pair("q", config.query.as_deref().unwrap_or("wallpaper"))
        .append_pair("image_type", config.image_type.as_deref().unwrap_or("photo"))
        .append_pair("per_page", "20")
        .append_pair("safesearch", &config.safesearch.unwrap_or(true).to_string())
        .append_pair("min_width", "1920")
        .append_pair("min_height", "1080");

    let response = client.get(url).send().await?;
    let pixabay_response: PixabayResponse = response.json().await?;

    let wallpapers = pixabay_response
        .hits
        .into_iter()
        .map(|photo| {
            WallpaperInfo {
                id: photo.id.to_string(),
                title: format!("Photo by {} on Pixabay", photo.user),
                url: photo.full_hd_url.clone(),
                source: WallpaperSource::Pixabay,
                local_path: None,
                cached: false,
            }
        })
        .collect();

    Ok(wallpapers)
}

pub async fn fetch_wallpapers_paginated(
    config: Option<PixabayConfig>,
    page: u32,
) -> Result<crate::types::PaginatedResponse<WallpaperListItem>, Box<dyn std::error::Error + Send + Sync>> {
    use crate::types::{PaginatedResponse, WallpaperListItem};

    let config = config.unwrap_or_default();
    let client = reqwest::Client::new();

    let mut url = reqwest::Url::parse(PIXABAY_API_URL)?;
    url.query_pairs_mut()
        .append_pair("key", PIXABAY_API_KEY)
        .append_pair("q", config.query.as_deref().unwrap_or("wallpaper"))
        .append_pair("image_type", config.image_type.as_deref().unwrap_or("photo"))
        .append_pair("per_page", "20")
        .append_pair("page", &page.to_string())
        .append_pair("safesearch", &config.safesearch.unwrap_or(true).to_string())
        .append_pair("min_width", "1920")
        .append_pair("min_height", "1080");

    let response = client.get(url).send().await?;
    let pixabay_response: PixabayResponse = response.json().await?;

    let total = pixabay_response.total_hits;
    let per_page = 20;
    let last_page = (total + per_page - 1) / per_page;

    let wallpapers: Vec<WallpaperListItem> = pixabay_response
        .hits
        .into_iter()
        .map(|photo| {
            WallpaperListItem {
                id: photo.id.to_string(),
                title: format!("Photo by {} on Pixabay", photo.user),
                url: photo.full_hd_url.clone(),
                source: WallpaperSource::Pixabay,
                thumb_url: photo.webformat_url.clone(),
            }
        })
        .collect();

    Ok(PaginatedResponse {
        data: wallpapers,
        current_page: page,
        last_page,
        per_page,
        total,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = PixabayConfig::default();
        assert_eq!(config.query, Some("wallpaper".to_string()));
        assert_eq!(config.image_type, Some("photo".to_string()));
        assert_eq!(config.safesearch, Some(true));
    }
}
