# Changelog

## [Unreleased]

### Added

- Backend: 壁纸下载缓存功能（download_wallpaper 命令）
- Frontend: 下载状态实时显示（加载动画和完成状态图标）
- Backend: Bing thumbnail generation with automatic image resizing and caching
- Frontend: Image error handling with fallback placeholders for failed image loads
- UI: Radial gradient background to main content areas for visual depth

### Changed

- Backend: Wallhaven thumbnails now use `thumbs.small` (smaller, faster) instead of `thumbs.large`
- UI: **Complete design overhaul of Wallpaper Explorer page to match Random Wallpaper page**
- UI: Unified header design across all pages (h-16, border-zinc-800/50, bg-zinc-950/40)
- UI: Unified footer design (h-20, border-t, circular icon buttons instead of rectangular text buttons)
- UI: Circular pagination with icon buttons (ChevronLeft, ChevronRight)
- UI: Source selector changed to dropdown with checkmark indicator
- UI: Thumbnail cards now use ring-1 ring-white/5 for subtle borders
- UI: Typography unified (text-sm, text-xs, text-[10px])
- UI: Background unified (bg-zinc-950 with radial gradient overlay)
- UI: Increased thumbnail minimum size from 200px to 220px for better visual balance
- Backend: Bing API now returns base64-encoded thumbnail URLs instead of full-size image URLs
- UI: "Change" and "Set as Wallpaper" buttons - unified size and style
- UI: "Set as Wallpaper" button - reduced visual prominence to match dark theme

### Fixed

- **Critical**: 修复了随机壁纸页面图片无法显示的问题 (使用 convertFileSrc 处理本地路径)
- **Critical**: 修复了设置壁纸失败的问题 (Rust 后端枚举序列化大小写不匹配)
- UI: 全局添加了设置壁纸的操作反馈提示 (Toast)
- **Critical**: Bing preview modal now shows full-size image instead of thumbnail
- Wallhaven: Added missing `thumbs.small` field in API response parsing
- Thumbnail display: Now properly handles images that fail to load
- Backend: Fixed borrow checker error in Bing thumbnail generation
