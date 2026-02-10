use crate::types::{WallpaperInfo, WallpaperListItem, WallpaperSource, PaginatedResponse};
use serde::Deserialize;

const PEXELS_API_URL: &str = "https://api.pexels.com/v1/curated";

#[derive(Debug, Deserialize)]
struct PexelsResponse {
    photos: Vec<PexelsPhoto>,
    total_results: u32,
    per_page: u32,
    page: u32,
}

#[derive(Debug, Deserialize)]
struct PexelsPhoto {
    id: u64,
    alt: String,
    src: PexelsSources,
    photographer: String,
    width: u32,
    height: u32,
}

#[derive(Debug, Deserialize)]
struct PexelsSources {
    original: String,
    large2x: String,
}

pub struct PexelsConfig {
    pub api_key: Option<String>,
}

impl Default for PexelsConfig {
    fn default() -> Self {
        Self {
            api_key: None,
        }
    }
}

pub async fn fetch_wallpapers(
    config: Option<PexelsConfig>,
) -> Result<Vec<WallpaperInfo>, Box<dyn std::error::Error + Send + Sync>> {
    let config = config.unwrap_or_default();
    let client = reqwest::Client::new();

    let mut url = reqwest::Url::parse(PEXELS_API_URL)?;
    url.query_pairs_mut()
        .append_pair("per_page", "20")
        .append_pair("orientation", "landscape");

    let mut request = client.get(url);
    if let Some(key) = &config.api_key {
        if !key.is_empty() {
            request = request.header("Authorization", key);
        }
    }

    let response = request.send().await?;
    let pexels_response: PexelsResponse = response.json().await?;

    let wallpapers = pexels_response
        .photos
        .into_iter()
        .filter(|photo| photo.width >= 1920 && photo.height >= 1080)
        .map(|photo| {
            let title = if !photo.alt.is_empty() {
                photo.alt.clone()
            } else {
                format!("Photo by {}", photo.photographer)
            };
            WallpaperInfo {
                id: photo.id.to_string(),
                title,
                url: photo.src.original.clone(),
                source: WallpaperSource::Pexels,
                local_path: None,
                cached: false,
            }
        })
        .collect();

    Ok(wallpapers)
}

pub async fn fetch_wallpapers_paginated(
    config: Option<PexelsConfig>,
    page: u32,
) -> Result<PaginatedResponse<WallpaperListItem>, Box<dyn std::error::Error + Send + Sync>> {
    let config = config.unwrap_or_default();
    let client = reqwest::Client::new();

    let mut url = reqwest::Url::parse(PEXELS_API_URL)?;
    url.query_pairs_mut()
        .append_pair("per_page", "20")
        .append_pair("page", &page.to_string())
        .append_pair("orientation", "landscape");

    let mut request = client.get(url);
    if let Some(key) = &config.api_key {
        if !key.is_empty() {
            request = request.header("Authorization", key);
        }
    }

    let response = request.send().await?;
    let pexels_response: PexelsResponse = response.json().await?;

    let wallpapers: Vec<WallpaperListItem> = pexels_response
        .photos
        .into_iter()
        .filter(|photo| photo.width >= 1920 && photo.height >= 1080)
        .map(|photo| {
            let title = if !photo.alt.is_empty() {
                photo.alt.clone()
            } else {
                format!("Photo by {}", photo.photographer)
            };
            WallpaperListItem {
                id: photo.id.to_string(),
                title,
                url: photo.src.original.clone(),
                source: WallpaperSource::Pexels,
                thumb_url: photo.src.large2x.clone(),
            }
        })
        .collect();

    let total_pages = (pexels_response.total_results / pexels_response.per_page) + 1;

    Ok(PaginatedResponse {
        data: wallpapers,
        current_page: pexels_response.page,
        last_page: total_pages,
        per_page: pexels_response.per_page,
        total: pexels_response.total_results,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = PexelsConfig::default();
        assert!(config.api_key.is_none());
    }
}
