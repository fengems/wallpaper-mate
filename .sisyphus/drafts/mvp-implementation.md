# Draft: Wallpaper Mate MVP Implementation Plan

## Requirements (confirmed from PRD)

### Project Overview
- **Name**: Wallpaper Mate
- **Description**: macOS wallpaper manager built with Tauri 2.0
- **Target**: MVP v1.0 with P0 features

### Technology Stack (confirmed)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Rust + Tauri 2.0
- **Key Dependencies**: 
  - `wallpaper` crate (v3.2+) for system wallpaper management
  - `tokio` for async operations
  - `reqwest` for HTTP requests
  - `serde` for serialization

### P0 Features for MVP
1. **Wallpaper Fetching**
   - Unsplash API (primary)
   - Wallhaven API
   - Bing Daily Wallpaper
   - Local download and caching
   - Filter by resolution, category, tags
   - Preview before setting

2. **Automatic Wallpaper Replacement**
   - Manual: one-click change
   - Timer: configurable intervals (30 min, 1 hour, daily)
   - Triggers: on startup, on wake from sleep
   - Multi-monitor support

3. **Menu Bar Application**
   - System tray icon in macOS menu bar
   - Quick actions: next wallpaper, pause/resume, open settings
   - Status indicator (active/paused)

4. **Settings Management**
   - Wallpaper source selection
   - Change frequency configuration
   - Resolution preferences
   - Cache management
   - Auto-run on startup

5. **Wallpaper History (P1 but included in MVP)**
   - Recent N wallpapers history
   - One-click restore to previous
   - Mark as favorite

## Technical Decisions

### Project Structure (from PRD)
```
wallpaper-mate/
  src/                    # Frontend (React)
    components/           # UI components
    hooks/                # Custom React hooks
    services/             # API service layer (Tauri IPC)
    store/                # State management
    types/                # TypeScript types
  src-tauri/              # Backend (Rust)
    src/
      commands/           # Tauri command handlers
      services/           # Business logic
      sources/            # Wallpaper source implementations
      utils/              # Helper functions
```

### Tauri 2.0 Key Points
- System Tray: Use `TrayIconBuilder` with menu items
- IPC: `#[tauri::command]` async functions
- State: Use `tauri::State` with `Mutex` for shared state
- Config: Use `tauri.conf.json` for app configuration

### Wallpaper Crate API
- `wallpaper::get()` - Get current wallpaper path
- `wallpaper::set_from_path(path)` - Set wallpaper from file
- `wallpaper::set_mode(mode)` - Set display mode (Crop, Fit, etc.)

### Unsplash API
- Base URL: `https://api.unsplash.com/`
- Auth: `Authorization: Client-ID YOUR_ACCESS_KEY`
- Key endpoints:
  - `GET /photos/random` - Random photo
  - `GET /search/photos` - Search photos
- Rate limit: 50 req/hour (demo), 5000 req/hour (production)

## Research Findings

### From Tauri 2.0 Docs
- Project init: `npm create vite@latest . && npx tauri init`
- System tray requires `TrayIconBuilder` in `setup` hook
- IPC commands can be async with `tokio`
- State management uses `app.manage()` with `Mutex`

### From wallpaper crate docs
- Simple API: `get()`, `set_from_path()`, `set_mode()`
- Supports macOS, Windows, Linux
- Mode enum: Crop, Fit, Stretch, etc.

## User Decisions (CONFIRMED 2026-01-28)

1. **Package Manager**: pnpm
2. **State Management**: Zustand
3. **API 密钥策略**: 混合模式（提供默认密钥，允许用户覆盖）
4. **Test Strategy**: TDD with Vitest
5. **App Icons**: 使用占位符，后续替换
6. **Development Priority**: 核心体验优先
7. **壁纸来源偏好**: 
   - 更加中文化的网站
   - 动漫风格图片多的网站
   - Bing 途径

## Wallpaper Source APIs (Research Results)

### 1. Bing Daily Wallpaper (PRIMARY - 零配置)
- **API**: `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN`
- **No API key required** ✅
- **Response**: JSON with image URL, title, copyright
- **Image URL**: `https://www.bing.com{url}` (1920x1080)
- **Rate limit**: None known
- **Pros**: 高质量，中文标题，无需配置

### 2. Wallhaven (SECONDARY - 动漫/艺术)
- **API**: `https://wallhaven.cc/api/v1/search`
- **API key**: Optional (免费注册获取，可访问 NSFW)
- **Categories**: general(100), anime(010), people(001)
- **Purity**: sfw(100), sketchy(010), nsfw(001)
- **Search**: `?q=anime&categories=010&sorting=random`
- **Rate limit**: 45 req/min
- **Pros**: 大量动漫壁纸，高分辨率，丰富的筛选选项

## Scope Boundaries (UPDATED)

### INCLUDE (MVP v1.0 - Core Experience)
- Tauri 2.0 project setup with pnpm
- React + Vite + TailwindCSS + shadcn/ui frontend
- Zustand state management
- Vitest test infrastructure (TDD)
- Menu bar (system tray) application
- **Wallpaper sources**: Bing Daily (primary), Wallhaven (secondary)
- Manual wallpaper change (one-click)
- Basic settings UI (source selection, API key config)
- Wallpaper caching to app data directory

### DEFER (After Core Experience)
- Timer-based auto change
- Event triggers (startup, wake)
- History and favorites
- Multiple wallpaper sources simultaneously

### EXCLUDE (Future versions)
- AI wallpaper generation (v2.0)
- Advanced scheduling with day/night (v1.5)
- Windows support (Future)
- Smart curation (v2.0)
- Custom collections (v1.5)
- Unsplash API (用户偏好中文/动漫来源)

## Constraints from AGENTS.md
- Functions ≤ 48 lines
- Max 5-10 local variables
- KISS and DRY principles
- Modular design
- Update docs/ on any code change
- No test/md files in root directory
- Use Chinese for communication

---
*Last updated: To be filled after interview*
