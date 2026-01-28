use crate::types::{WallpaperInfo, WallpaperSource};
use serde::Deserialize;

const WALLHAVEN_API_URL: &str = "https://wallhaven.cc/api/v1/search";
const DEFAULT_API_KEY: &str = "";

#[derive(Debug, Deserialize)]
struct WallhavenResponse {
    data: Vec<WallhavenImage>,
}

#[derive(Debug, Deserialize)]
struct WallhavenImage {
    id: String,
    path: String,
    category: String,
    purity: String,
    thumbs: WallhavenThumbs,
    dimension_x: u32,
    dimension_y: u32,
}

#[derive(Debug, Deserialize)]
struct WallhavenThumbs {
    original: String,
}

#[derive(Debug, Deserialize)]
struct WallhavenImageDetails {
    data: WallhavenImageDetailData,
}

#[derive(Debug, Deserialize)]
struct WallhavenImageDetailData {
    tags: Vec<WallhavenTag>,
}

#[derive(Debug, Deserialize)]
struct WallhavenTag {
    name: String,
}

pub struct WallhavenConfig {
    pub categories: String,
    pub purity: String,
    pub sorting: String,
    pub api_key: Option<String>,
}

impl Default for WallhavenConfig {
    fn default() -> Self {
        Self {
            categories: "010".to_string(),
            purity: "100".to_string(),
            sorting: "random".to_string(),
            api_key: None,
        }
    }
}

pub async fn get_wallpaper_details(id: &str, api_key: Option<String>) -> Result<Vec<String>, Box<dyn std::error::Error + Send + Sync>> {
    let url = format!("{}/{}", WALLHAVEN_API_URL.replace("/search", "/w"), id);
    let client = if let Some(key) = api_key {
        if !key.is_empty() {
            reqwest::Client::builder()
                .default_headers(create_auth_header(&key))
                .build()?
        } else {
            reqwest::Client::new()
        }
    } else {
        reqwest::Client::new()
    };

    let response = client.get(url).send().await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;
    let details: WallhavenImageDetails = response.json().await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;

    Ok(details.data.tags.into_iter().map(|t| t.name).collect())
}

pub async fn search_wallpapers(config: Option<WallhavenConfig>) -> Result<Vec<WallpaperInfo>, Box<dyn std::error::Error + Send + Sync>> {
    let config = config.unwrap_or_default();
    let mut url = reqwest::Url::parse(WALLHAVEN_API_URL)?;
    url.query_pairs_mut()
        .append_pair("categories", &config.categories)
        .append_pair("purity", &config.purity)
        .append_pair("sorting", &config.sorting)
        .append_pair("page", "1");

    if let Some(key) = &config.api_key {
        if !key.is_empty() {
            url.query_pairs_mut().append_pair("apikey", key);
        }
    }

    let client = if let Some(key) = &config.api_key {
        if !key.is_empty() {
            reqwest::Client::builder()
                .default_headers(create_auth_header(key))
                .build()?
        } else {
            reqwest::Client::new()
        }
    } else {
        reqwest::Client::new()
    };

    let response = client.get(url).send().await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;
    let wallhaven_response: WallhavenResponse = response.json().await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;

    let wallpapers = wallhaven_response
        .data
        .into_iter()
        .filter(|img| img.dimension_x > img.dimension_y)
        .map(|img| {
            WallpaperInfo {
                id: img.id.clone(),
                title: format!("Wallhaven #{} ({}x{})", img.id, img.dimension_x, img.dimension_y),
                url: img.path.clone(),
                source: WallpaperSource::Wallhaven,
                local_path: None,
                cached: false,
            }
        })
        .collect();

    Ok(wallpapers)
}

fn create_auth_header(api_key: &str) -> reqwest::header::HeaderMap {
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        "X-API-Key",
        reqwest::header::HeaderValue::from_str(api_key).unwrap(),
    );
    headers
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = WallhavenConfig::default();
        assert_eq!(config.categories, "010");
        assert_eq!(config.purity, "100");
        assert_eq!(config.sorting, "random");
    }

    #[tokio::test]
    async fn test_search_wallpapers() {
        let result = search_wallpapers(None).await;
        assert!(result.is_ok());
        let wallpapers = result.unwrap();
        assert!(!wallpapers.is_empty());
        assert_eq!(wallpapers[0].source, WallpaperSource::Wallhaven);
    }

    #[tokio::test]
    async fn test_search_with_api_key() {
        let config = WallhavenConfig {
            api_key: Some("test_key".to_string()),
            ..Default::default()
        };
        let result = search_wallpapers(Some(config)).await;
        assert!(result.is_ok());
    }
}

