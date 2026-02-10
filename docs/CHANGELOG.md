# Changelog

## [Unreleased]

### Added

- Frontend: 新增独立的设置页面 (`/settings`)，用于管理 API Keys
- Frontend: Settings 页面支持 Wallhaven、Unsplash、Pixabay、Pexels 四个来源的 API Key 配置
- Frontend: API Keys 通过 zustand persist 持久化到 localStorage，重启不丢失
- Frontend: 新增 `src/utils/apiKeys.ts` 统一工具函数，消除各页面重复的 `getApiKeyForSource` 实现
- Frontend: Sidebar 底部新增设置图标导航入口

### Changed

- Frontend: 从 PageHeader 下拉菜单中移除了 API Key 设置入口，改为独立页面
- Frontend: API Key 状态从废弃的 settingsStore 迁移至 appStore 统一管理
- Frontend: RandomWallpaper、WallpaperList、AutoSwitch 页面改用共享的 `getApiKeyForSource` 工具函数

### Fixed

- Backend: 修复 `pnpm tauri dev` 编译错误（移除废弃的 ProviderConfig 枚举，provider 接口改为接收 `(WallpaperSource, Option<String>)`）
- Frontend: 修复 AutoSwitch 页面 `apiKey` 变量未定义的运行时错误

### Added (previous)

- Backend: 新增 Pexels 壁纸来源，支持高质量视频和图片素材
- Backend: 模块化架构重构，所有壁纸来源采用统一接口规范
- Backend: 添加即插即用的来源系统，添加新来源只需三步
- Frontend: 更新 WallpaperList、RandomWallpaper、AutoSwitch 页面，支持 Pexels

### Changed

- Backend: 重构 commands/wallpaper.rs，使用新的 provider 系统
- Backend: 简化来源调用逻辑，消除重复的 match 分支
- Backend: 统一错误处理，使用 ProviderError 类型
- Backend: 添加新的壁纸来源模块化架构

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
