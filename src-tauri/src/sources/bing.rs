use crate::types::{WallpaperInfo, WallpaperSource};
use serde::Deserialize;

const BING_API_URL: &str = "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN";

#[derive(Debug, Deserialize)]
struct BingResponse {
    images: Vec<BingImage>,
}

#[derive(Debug, Deserialize)]
struct BingImage {
    url: String,
    title: String,
    #[allow(dead_code)]
    copyright: String,
}

pub async fn fetch_wallpapers() -> Result<Vec<WallpaperInfo>, reqwest::Error> {
    let response = reqwest::get(BING_API_URL).await?;
    let bing_response: BingResponse = response.json().await?;

    let wallpapers = bing_response
        .images
        .into_iter()
        .map(|img| {
            let full_url = format!("https://www.bing.com{}", img.url);
            WallpaperInfo {
                id: url_to_id(&img.url),
                title: img.title.clone(),
                url: full_url,
                source: WallpaperSource::Bing,
                local_path: None,
                cached: false,
            }
        })
        .collect();

    Ok(wallpapers)
}

pub async fn fetch_wallpapers_as_list(page: u32) -> Result<crate::types::PaginatedResponse<crate::types::WallpaperListItem>, reqwest::Error> {
    use crate::types::{PaginatedResponse, WallpaperListItem, WallpaperSource};

    // Bing API 只返回最近 8 天的壁纸，idx 参数表示偏移量
    // idx 范围是 0-7，超过这个范围就没有数据了
    let idx = (page - 1) * 8;
    let url = if idx < 8 {
        format!("https://www.bing.com/HPImageArchive.aspx?format=js&idx={}&n=8&mkt=zh-CN", idx)
    } else {
        // 如果超出范围，返回空数据
        return Ok(PaginatedResponse {
            data: vec![],
            current_page: page,
            last_page: 1,
            per_page: 8,
            total: 0,
        });
    };

    let response = reqwest::get(&url).await?;
    let bing_response: BingResponse = response.json().await?;

    let wallpapers: Vec<WallpaperListItem> = bing_response
        .images
        .into_iter()
        .map(|img| {
            let full_url = format!("https://www.bing.com{}", img.url);
            WallpaperListItem {
                id: url_to_id(&img.url),
                title: img.title.clone(),
                url: full_url.clone(),
                source: WallpaperSource::Bing,
                thumb_url: full_url,
            }
        })
        .collect();

    let total = wallpapers.len() as u32;
    // Bing 最多只有 8 天的数据
    let last_page = if total > 0 { 1 } else { 1 };

    Ok(PaginatedResponse {
        data: wallpapers,
        current_page: page,
        last_page,
        per_page: 8,
        total,
    })
}

fn url_to_id(url: &str) -> String {
    url.split('/')
        .last()
        .unwrap_or("unknown")
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_url_to_id() {
        assert_eq!(url_to_id("/th?id=OHR.xxx_1920x1080.jpg"), "OHR.xxx_1920x1080.jpg");
        assert_eq!(url_to_id("/path/to/image.jpg"), "image.jpg");
    }

    #[tokio::test]
    async fn test_fetch_wallpapers() {
        let result = fetch_wallpapers().await;
        assert!(result.is_ok());
        let wallpapers = result.unwrap();
        assert!(!wallpapers.is_empty());
        assert_eq!(wallpapers[0].source, WallpaperSource::Bing);
    }
}

