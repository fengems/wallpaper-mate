# 壁纸来源模块化架构

## 概述

项目采用模块化设计，每个壁纸来源（Bing、Wallhaven、Unsplash 等）都是独立的模块，遵循统一的接口规范。

## 架构原则

1. **简洁性** - 遵循 Linus "Good Taste" 哲学，代码简单直接
2. **显式优于抽象** - 不使用 trait 对象，直接通过 enum 分发
3. **类型安全** - 编译时检查，避免运行时错误
4. **即插即用** - 添加新来源只需三步

## 如何添加新来源

### 步骤 1：创建来源模块

在 `src-tauri/src/sources/` 下创建新文件（如 `new_source.rs`）：

```rust
use crate::types::{WallpaperInfo, WallpaperListItem, WallpaperSource, PaginatedResponse};
use serde::Deserialize;

const NEW_SOURCE_API_URL: &str = "https://api.example.com";

#[derive(Debug, Deserialize)]
struct NewSourceResponse {
    // API 响应字段
}

pub struct NewSourceConfig {
    pub api_key: Option<String>,
}

impl Default for NewSourceConfig {
    fn default() -> Self {
        Self {
            api_key: None,
        }
    }
}

// 随机获取壁纸
pub async fn fetch_wallpapers(
    config: Option<NewSourceConfig>,
) -> Result<Vec<WallpaperInfo>, Box<dyn std::error::Error + Send + Sync>> {
    let config = config.unwrap_or_default();
    let client = reqwest::Client::new();

    // 实现获取逻辑
    // ...
    Ok(wallpapers)
}

// 分页获取壁纸
pub async fn fetch_wallpapers_paginated(
    config: Option<NewSourceConfig>,
    page: u32,
) -> Result<PaginatedResponse<WallpaperListItem>, Box<dyn std::error::Error + Send + Sync>> {
    let config = config.unwrap_or_default();
    let client = reqwest::Client::new();

    // 实现分页获取逻辑
    // ...
    Ok(paginated_response)
}
```

### 步骤 2：添加枚举值

在 `src-tauri/src/types/mod.rs` 中添加新来源：

```rust
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum WallpaperSource {
    Bing,
    Wallhaven,
    Unsplash,
    Pixabay,
    Pexels,
    NewSource,  // 添加新来源
}
```

同时在 `src-tauri/src/commands/wallpaper.rs` 中更新 `from_str` 方法：

```rust
impl WallpaperSource {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            // ...
            "new_source" => Some(WallpaperSource::NewSource),
            _ => None,
        }
    }
}
```

### 步骤 3：注册到 provider 系统

在 `src-tauri/src/sources/mod.rs` 中导出新模块：

```rust
pub mod bing;
pub mod wallhaven;
pub mod unsplash;
pub mod pixabay;
pub mod pexels;
pub mod new_source;  // 添加新模块
pub mod provider;

pub use provider::{fetch_paginated, fetch_random, list_sources, ProviderConfig, ProviderError};
```

在 `src-tauri/src/sources/provider.rs` 中添加配置和处理：

```rust
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(untagged)]
pub enum ProviderConfig {
    Bing,
    Wallhaven { /* ... */ },
    // ...
    NewSource {
        api_key: Option<String>,
    },
}

pub async fn fetch_random(
    source: WallpaperSource,
    api_key: Option<String>,
) -> Result<Vec<WallpaperInfo>, ProviderError> {
    match source {
        // ...
        WallpaperSource::NewSource => {
            let config = crate::sources::new_source::NewSourceConfig {
                api_key,
            };
            Ok(crate::sources::new_source::fetch_wallpapers(Some(config))
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))?)
        }
    }
}

pub async fn fetch_paginated(
    source: WallpaperSource,
    api_key: Option<String>,
    page: u32,
) -> Result<PaginatedResponse<WallpaperListItem>, ProviderError> {
    match source {
        // ...
        WallpaperSource::NewSource => {
            let config = crate::sources::new_source::NewSourceConfig {
                api_key,
            };
            Ok(crate::sources::new_source::fetch_wallpapers_paginated(Some(config), page)
                .await
                .map_err(|e| ProviderError::Api(e.to_string()))?)
        }
    }
}

pub fn list_sources() -> Vec<String> {
    vec![
        // ...
        "new_source".to_string(),
    ]
}
```

在 `src-tauri/src/services/cache.rs` 中添加缓存目录：

```rust
let source_dir = cache_dir.join(match wallpaper.source {
    // ...
    WallpaperSource::NewSource => "new_source",
});
```

### 步骤 4：更新前端（可选）

在前端 `src/types/index.ts` 中添加：

```typescript
export const WallpaperSource = {
  // ...
  NewSource: 'new_source',
} as const;
```

在各个页面（`WallpaperList.tsx`, `RandomWallpaper.tsx`, `AutoSwitch.tsx`）的 `SOURCES` 数组中添加：

```typescript
const SOURCES = [
  // ...
  {
    id: 'new_source' as const,
    label: 'New Source',
    color: 'from-gray-500 to-gray-600',
    supportsPagination: true,
  },
];
```

## 当前支持的来源

1. **Bing Daily** - 高质量每日壁纸，无需 API Key
2. **Wallhaven** - 大量动漫和艺术壁纸，支持分类和搜索
3. **Unsplash** - 高质量摄影作品，免费 API 有速率限制
4. **Pixabay** - 大量免版权图片，支持搜索
5. **Pexels** - 精选高质量视频和图片素材

## 优势

1. **隔离性好** - 每个来源独立，互不影响
2. **易于测试** - 可以单独测试每个来源
3. **类型安全** - 编译时检查，避免运行时错误
4. **符合 Rust 惯用法** - 使用 enum match 而非动态分发
5. **简单直接** - 代码一目了然，符合 Linus 的代码品味

## 文件结构

```
src-tauri/src/sources/
├── mod.rs              # 模块导出
├── provider.rs         # 统一接口和配置
├── bing.rs            # Bing 来源实现
├── wallhaven.rs        # Wallhaven 来源实现
├── unsplash.rs        # Unsplash 来源实现
├── pixabay.rs         # Pixabay 来源实现
├── pexels.rs          # Pexels 来源实现
└── [新来源].rs        # 按需添加
```

## 注意事项

1. **错误处理** - 统一使用 `ProviderError` 类型
2. **配置结构** - 每个来源有自己的配置类型
3. **缓存路径** - 新来源需要在 `cache.rs` 中添加缓存目录
4. **前端集成** - 记得在所有相关页面添加来源选项
5. **API Key** - 如果来源需要 API Key，确保在前端设置中添加对应字段

---

**最后更新**: $(date "+%Y年%m月%d日")
