use crate::types::{PaginatedResponse, WallpaperInfo, WallpaperListItem, WallpaperSource};

/**
 * 统一错误类型
 */
#[derive(Debug, thiserror::Error)]
pub enum ProviderError {
    #[error("Network error: {0}")]
    Network(String),

    #[error("API error: {0}")]
    Api(String),

    #[error("Parse error: {0}")]
    Parse(String),

    #[error("Invalid config: {0}")]
    InvalidConfig(String),

    #[error("Not found")]
    NotFound,

    #[error("Unknown source: {0}")]
    UnknownSource(String),
}

/**
 * 通过来源类型获取随机壁纸
 *
 * api_key 为可选参数，仅 Wallhaven/Pexels 等需要
 */
pub async fn fetch_random(
    source: WallpaperSource,
    api_key: Option<String>,
) -> Result<Vec<WallpaperInfo>, ProviderError> {
    match source {
        WallpaperSource::Bing => {
            crate::sources::bing::fetch_wallpapers()
                .await
                .map_err(|e| ProviderError::Network(e.to_string()))
        }
        WallpaperSource::Wallhaven => {
            let config = crate::sources::wallhaven::WallhavenConfig {
                api_key,
                ..Default::default()
            };
            crate::sources::wallhaven::search_wallpapers(Some(config))
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))
        }
        WallpaperSource::Unsplash => {
            crate::sources::unsplash::fetch_wallpapers(None)
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))
        }
        WallpaperSource::Pixabay => {
            crate::sources::pixabay::fetch_wallpapers(None)
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))
        }
        WallpaperSource::Pexels => {
            let config = crate::sources::pexels::PexelsConfig {
                api_key,
                ..Default::default()
            };
            crate::sources::pexels::fetch_wallpapers(Some(config))
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))
        }
        _ => Err(ProviderError::UnknownSource(format!("{:?}", source))),
    }
}

/**
 * 通过来源类型分页获取壁纸
 */
pub async fn fetch_paginated(
    source: WallpaperSource,
    api_key: Option<String>,
    page: u32,
) -> Result<PaginatedResponse<WallpaperListItem>, ProviderError> {
    match source {
        WallpaperSource::Bing => {
            crate::sources::bing::fetch_wallpapers_as_list(page)
                .await
                .map_err(|e| ProviderError::Network(e.to_string()))
        }
        WallpaperSource::Wallhaven => {
            let config = crate::sources::wallhaven::WallhavenConfig {
                api_key,
                ..Default::default()
            };
            crate::sources::wallhaven::search_wallpapers_paginated(Some(config), page)
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))
        }
        WallpaperSource::Unsplash => {
            crate::sources::unsplash::fetch_wallpapers_paginated(None, page)
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))
        }
        WallpaperSource::Pixabay => {
            crate::sources::pixabay::fetch_wallpapers_paginated(None, page)
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))
        }
        WallpaperSource::Pexels => {
            let config = crate::sources::pexels::PexelsConfig {
                api_key,
                ..Default::default()
            };
            crate::sources::pexels::fetch_wallpapers_paginated(Some(config), page)
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))
        }
        _ => Err(ProviderError::UnknownSource(format!("{:?}", source))),
    }
}

/**
 * 获取所有支持的来源 ID 列表
 */
pub fn list_sources() -> Vec<String> {
    vec![
        "bing".to_string(),
        "wallhaven".to_string(),
        "unsplash".to_string(),
        "pixabay".to_string(),
        "pexels".to_string(),
    ]
}
