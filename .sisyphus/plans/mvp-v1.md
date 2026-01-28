# Wallpaper Mate MVP v1.0 Implementation Plan

## TL;DR

> **Quick Summary**: 使用 Tauri 2.0 + React 构建 macOS 菜单栏壁纸管理器，支持从 Bing Daily 和 Wallhaven 获取壁纸，实现一键更换桌面壁纸的核心体验。
> 
> **Deliverables**:
> - 可运行的 macOS 菜单栏应用
> - Bing Daily Wallpaper 集成（零配置）
> - Wallhaven API 集成（动漫壁纸）
> - 一键更换壁纸功能
> - 基础设置界面
> - 壁纸本地缓存
> 
> **Estimated Effort**: Medium (2-3 weeks)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 5 → Task 8 → Task 11 → Task 14

---

## Context

### Original Request
用户希望为 Wallpaper Mate 项目创建 MVP (v1.0) 的完整实施计划，优先实现核心体验：菜单栏 + 手动换壁纸 + 壁纸来源（偏好中文化、动漫风格）。

### Interview Summary
**Key Discussions**:
- **包管理器**: pnpm（更快，磁盘效率高）
- **状态管理**: Zustand（轻量、简单）
- **API 密钥策略**: 混合模式（默认密钥 + 用户可覆盖）
- **测试策略**: TDD with Vitest
- **壁纸来源**: Bing Daily（主要）+ Wallhaven（动漫）

**Research Findings**:
- **Bing API**: 无需密钥，返回高质量中文壁纸，格式简单
- **Wallhaven API**: 45 req/min 限制，丰富的动漫壁纸，支持分类筛选
- **Tauri 2.0**: 使用 `TrayIconBuilder` 实现菜单栏，`#[tauri::command]` 实现 IPC
- **wallpaper crate**: `set_from_path()` 设置壁纸，支持 macOS

### Metis Review
**Identified Gaps** (addressed):
- **缓存目录**: 使用 Tauri 的 `app_data_dir()` 作为缓存位置
- **错误处理策略**: 网络错误时显示 toast 通知，使用缓存的壁纸作为 fallback
- **图标占位符**: 使用 SF Symbols 或简单 PNG 图标，后续替换
- **多显示器**: MVP 阶段仅支持主显示器

---

## Work Objectives

### Core Objective
构建一个 macOS 菜单栏应用，用户可以一键从 Bing Daily 或 Wallhaven 获取壁纸并设置为桌面背景。

### Concrete Deliverables
- `src-tauri/`: Rust 后端代码（命令、服务、壁纸源）
- `src/`: React 前端代码（组件、状态、类型）
- 可运行的 `.app` 文件（开发模式）
- 完整的测试覆盖（Vitest + Rust tests）
- `docs/` 目录下的技术文档

### Definition of Done

- [x] `pnpm tauri dev` 启动应用无错误

- [x] 菜单栏图标显示，点击弹出菜单

- [x] "下一张壁纸" 按钮可用，点击后壁纸更换

- [x] 设置窗口可打开，可选择壁纸来源

- [x] Vitest 测试全部通过

- [x] Rust 测试全部通过

### Must Have
- macOS 菜单栏图标和菜单
- Bing Daily Wallpaper 获取
- Wallhaven API 集成
- 壁纸下载和本地缓存
- 一键更换壁纸
- 基础设置 UI

### Must NOT Have (Guardrails)
- ❌ 不实现定时器自动更换（延后）
- ❌ 不实现启动/唤醒事件触发（延后）
- ❌ 不实现历史记录和收藏（延后）
- ❌ 不支持 Windows（未来版本）
- ❌ 不集成 Unsplash（用户偏好其他来源）
- ❌ 不过度抽象 - 保持代码简单直接
- ❌ 函数不超过 48 行
- ❌ 局部变量不超过 5-10 个

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO（新项目）
- **User wants tests**: TDD
- **Framework**: Vitest (Frontend) + Rust built-in tests (Backend)

### TDD Workflow

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**
1. **RED**: Write failing test first
   - Test file: `[path].test.ts` or `[path]_test.rs`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Expected: PASS (still)

**Test Commands:**
- Frontend: `pnpm test` (Vitest)
- Backend: `cargo test` (Rust)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - Start Immediately):
├── Task 1: Tauri 2.0 项目初始化 [no dependencies]
└── Task 2: 测试基础设施设置 [depends: 1, but can start config in parallel]

Wave 2 (Backend Core - After Wave 1):
├── Task 3: Rust 模块结构搭建 [depends: 1]
├── Task 4: wallpaper crate 集成 [depends: 3]
├── Task 5: Bing Daily API 服务 [depends: 3]
└── Task 6: Wallhaven API 服务 [depends: 3]

Wave 3 (Backend Features - After Task 4,5,6):
├── Task 7: 缓存管理服务 [depends: 4]
├── Task 8: Tauri Commands 层 [depends: 4,5,6,7]
└── Task 9: System Tray 菜单栏 [depends: 8]

Wave 4 (Frontend - After Wave 2 partial):
├── Task 10: React 前端结构搭建 [depends: 1]
├── Task 11: Zustand 状态管理 [depends: 10]
├── Task 12: shadcn/ui 组件库集成 [depends: 10]
└── Task 13: Tauri IPC 服务层 [depends: 8,11]

Wave 5 (Integration - After Wave 3,4):
├── Task 14: 设置界面 UI [depends: 12,13]
├── Task 15: 壁纸预览组件 [depends: 12,13]
└── Task 16: 端到端集成测试 [depends: all]

Wave 6 (Polish - Final):
└── Task 17: 文档和清理 [depends: 16]

Critical Path: Task 1 → Task 3 → Task 5 → Task 8 → Task 9 → Task 13 → Task 16
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2,3,10 | None |
| 2 | 1 | All tests | 3 (partial) |
| 3 | 1 | 4,5,6 | 2,10 |
| 4 | 3 | 7,8 | 5,6 |
| 5 | 3 | 8 | 4,6 |
| 6 | 3 | 8 | 4,5 |
| 7 | 4 | 8 | 5,6 |
| 8 | 4,5,6,7 | 9,13 | 10,11,12 |
| 9 | 8 | 16 | 14,15 |
| 10 | 1 | 11,12 | 3,4,5,6 |
| 11 | 10 | 13 | 12 |
| 12 | 10 | 14,15 | 11 |
| 13 | 8,11 | 14,15 | 12 |
| 14 | 12,13 | 16 | 15 |
| 15 | 12,13 | 16 | 14 |
| 16 | 9,14,15 | 17 | None |
| 17 | 16 | None | None |

---

## TODOs

### Phase 1: Foundation (Wave 1)


- [x] 1. Tauri 2.0 项目初始化

  **What to do**:
  - 使用 pnpm 创建 Vite + React + TypeScript 项目
  - 初始化 Tauri 2.0（`pnpm add -D @tauri-apps/cli@latest`）
  - 配置 `tauri.conf.json`（app name, identifier, window settings）
  - 设置 TailwindCSS
  - 创建项目目录结构

  **Must NOT do**:
  - 不安装任何非必要依赖
  - 不创建复杂的配置

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准的项目初始化流程，步骤明确，无需复杂推理
  - **Skills**: [`context7`]
    - `context7`: 查询 Tauri 2.0 最新文档确保配置正确

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (独立启动)
  - **Blocks**: Tasks 2, 3, 10
  - **Blocked By**: None (第一个任务)

  **References**:
  - Tauri 2.0 create project: https://v2.tauri.app/start/create-project/
  - Vite React template: `pnpm create vite . --template react-ts`
  - TailwindCSS with Vite: https://tailwindcss.com/docs/guides/vite

  **Directory Structure to Create**:
  ```
  wallpaper-mate/
  ├── src/                    # React frontend
  │   ├── components/
  │   ├── hooks/
  │   ├── services/
  │   ├── store/
  │   └── types/
  ├── src-tauri/              # Rust backend
  │   └── src/
  │       ├── commands/
  │       ├── services/
  │       ├── sources/
  │       └── utils/
  ├── docs/
  └── tests/                  # E2E tests
  ```

  **Acceptance Criteria**:
  
- [x] `pnpm install` 成功完成
  
- [x] `pnpm tauri dev` 启动开发服务器，显示默认窗口
  
- [x] 项目结构符合上述目录布局
  
- [x] TailwindCSS 可用（测试 class 生效）

  **Commit**: YES
  - Message: `feat: 初始化 Tauri 2.0 + React + Vite 项目`
  - Files: `package.json, pnpm-lock.yaml, src-tauri/*, src/*, tailwind.config.js, etc.`

---


- [x] 2. 测试基础设施设置

  **What to do**:
  - 安装 Vitest 和相关测试依赖
  - 配置 `vitest.config.ts`
  - 创建示例测试验证配置正确
  - 在 `src-tauri/` 中配置 Rust 测试模块
  - 添加 `pnpm test` 脚本

  **Must NOT do**:
  - 不在根目录创建测试文件
  - 不安装 Jest（使用 Vitest）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 测试框架配置是标准流程
  - **Skills**: [`context7`]
    - `context7`: 查询 Vitest 文档确保配置正确

  **Parallelization**:
  - **Can Run In Parallel**: YES (部分与 Task 3)
  - **Parallel Group**: Wave 1
  - **Blocks**: All subsequent tasks (测试是 TDD 基础)
  - **Blocked By**: Task 1

  **References**:
  - Vitest setup: https://vitest.dev/guide/
  - Vitest with React: https://vitest.dev/guide/browser/
  - Rust testing: https://doc.rust-lang.org/book/ch11-01-writing-tests.html

  **Acceptance Criteria**:
  
- [x] `pnpm test` 运行成功
  
- [x] 示例测试文件 `src/__tests__/example.test.ts` 通过
  
- [x] `cargo test` 在 `src-tauri/` 中运行成功
  
- [x] 示例 Rust 测试 `src-tauri/src/lib.rs` 中的 `#[cfg(test)]` 通过

  **Commit**: YES
  - Message: `chore: 设置 Vitest 和 Rust 测试基础设施`
  - Files: `vitest.config.ts, src/__tests__/*, src-tauri/src/lib.rs`

---

### Phase 2: Backend Core (Wave 2)


- [x] 3. Rust 模块结构搭建

  **What to do**:
  - 在 `src-tauri/src/` 下创建模块目录结构
  - 创建 `mod.rs` 文件定义模块
  - 添加必要的 Rust 依赖到 `Cargo.toml`
  - 定义核心类型（WallpaperInfo, Source, Error）

  **Must NOT do**:
  - 不实现具体业务逻辑（仅结构）
  - 不添加非必要依赖

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Rust 模块设计需要良好的架构思维
  - **Skills**: [`context7`]
    - `context7`: 查询 Tauri 2.0 Rust 最佳实践

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 2, 10)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 4, 5, 6
  - **Blocked By**: Task 1

  **References**:
  - PRD 模块结构: `docs/PRD.md` (lines 236-249)
  - Rust module system: https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html

  **Cargo.toml Dependencies to Add**:
  ```toml
  [dependencies]
  wallpaper = "3.2"
  tokio = { version = "1", features = ["full"] }
  reqwest = { version = "0.11", features = ["json"] }
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  thiserror = "1"
  dirs = "5"
  ```

  **Module Structure**:
  ```
  src-tauri/src/
  ├── lib.rs           # Tauri app entry, re-exports
  ├── commands/
  │   ├── mod.rs
  │   └── wallpaper.rs # Tauri commands
  ├── services/
  │   ├── mod.rs
  │   ├── cache.rs     # Cache management
  │   └── wallpaper.rs # Wallpaper operations
  ├── sources/
  │   ├── mod.rs
  │   ├── bing.rs      # Bing Daily API
  │   └── wallhaven.rs # Wallhaven API
  └── types/
      ├── mod.rs
      └── wallpaper.rs # WallpaperInfo, Source enum
  ```

  **Acceptance Criteria**:
  
- [x] `cargo build` 成功编译
  
- [x] 所有模块正确导出（`pub mod` 声明）
  
- [x] 类型定义可被其他模块使用
  
- [x] `cargo test` 通过（空测试）

  **Commit**: YES
  - Message: `feat: 搭建 Rust 后端模块结构`
  - Files: `src-tauri/Cargo.toml, src-tauri/src/**/*.rs`

---


- [x] 4. wallpaper crate 集成

  **What to do**:
  - 在 `services/wallpaper.rs` 中封装 wallpaper crate
  - 实现 `set_wallpaper(path: &str)` 函数
  - 实现 `get_current_wallpaper()` 函数
  - 添加错误处理
  - 编写单元测试

  **Must NOT do**:
  - 不处理多显示器（MVP 仅主显示器）
  - 不添加复杂的重试逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: wallpaper crate API 简单，封装直接
  - **Skills**: []
    - 无需特殊技能，crate 文档已在研究阶段获取

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 5, 6)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: Task 3

  **References**:
  - wallpaper crate: https://docs.rs/wallpaper/3.2.0/wallpaper/
  - API: `wallpaper::set_from_path()`, `wallpaper::get()`

  **TDD Steps**:
  1. **RED**: 写测试 `test_set_wallpaper_from_valid_path`
  2. **GREEN**: 实现 `set_wallpaper()` 函数
  3. **REFACTOR**: 提取错误类型到 `types/error.rs`

  **Acceptance Criteria**:
  
- [x] 测试文件存在: `src-tauri/src/services/wallpaper.rs` 包含 `#[cfg(test)]` 模块
  
- [x] 测试通过: `cargo test services::wallpaper`
  
- [x] 函数签名: `pub fn set_wallpaper(path: &Path) -> Result<(), WallpaperError>`
  
- [x] 手动验证: 调用函数后桌面壁纸更改

  **Commit**: YES
  - Message: `feat: 集成 wallpaper crate，实现壁纸设置功能`
  - Files: `src-tauri/src/services/wallpaper.rs`

---


- [x] 5. Bing Daily API 服务

  **What to do**:
  - 在 `sources/bing.rs` 中实现 Bing Daily Wallpaper API 客户端
  - 解析 API 响应 JSON
  - 返回 `WallpaperInfo` 结构
  - 支持获取多张壁纸（n=1-8）
  - 编写单元测试（mock HTTP）

  **Must NOT do**:
  - 不硬编码 URL（使用常量）
  - 不忽略错误（proper error handling）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: HTTP 请求和 JSON 解析是标准操作
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 4, 6)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8
  - **Blocked By**: Task 3

  **References**:
  - Bing API (from research): `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN`
  - Response format:
    ```json
    {
      "images": [{
        "url": "/th?id=OHR.xxx_1920x1080.jpg",
        "title": "壁纸标题",
        "copyright": "版权信息"
      }]
    }
    ```

  **TDD Steps**:
  1. **RED**: 写测试 `test_parse_bing_response`
  2. **GREEN**: 实现 `BingSource::fetch_wallpapers()` 
  3. **REFACTOR**: 提取 URL 构建到独立函数

  **Acceptance Criteria**:
  
- [x] 测试文件: `src-tauri/src/sources/bing.rs` 包含测试模块
  
- [x] 单元测试通过: `cargo test sources::bing`
  
- [x] 返回类型: `Vec<WallpaperInfo>`
  
- [x] 手动验证: 调用 API 返回有效的壁纸信息

  **Commit**: YES
  - Message: `feat: 实现 Bing Daily Wallpaper API 服务`
  - Files: `src-tauri/src/sources/bing.rs`

---


- [x] 6. Wallhaven API 服务

  **What to do**:
  - 在 `sources/wallhaven.rs` 中实现 Wallhaven API 客户端
  - 支持搜索参数（categories, purity, sorting）
  - 支持可选 API key（混合模式）
  - 解析 API 响应
  - 编写单元测试

  **Must NOT do**:
  - 不支持 NSFW 内容（保持 SFW only）
  - 不实现分页（MVP 只取第一页）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 类似 Task 5，HTTP + JSON 操作
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 4, 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8
  - **Blocked By**: Task 3

  **References**:
  - Wallhaven API (from research): `https://wallhaven.cc/api/v1/search`
  - Parameters: `?categories=010&purity=100&sorting=random`
  - Response: `{ "data": [{ "id": "xxx", "path": "https://...", "thumbs": {...} }] }`

  **TDD Steps**:
  1. **RED**: 写测试 `test_parse_wallhaven_response`
  2. **GREEN**: 实现 `WallhavenSource::search_wallpapers()`
  3. **REFACTOR**: 使用 builder pattern 构建查询参数

  **Acceptance Criteria**:
  
- [x] 测试通过: `cargo test sources::wallhaven`
  
- [x] 支持 categories 筛选（anime = 010）
  
- [x] 支持可选 API key
  
- [x] 返回类型: `Vec<WallpaperInfo>`

  **Commit**: YES
  - Message: `feat: 实现 Wallhaven API 服务`
  - Files: `src-tauri/src/sources/wallhaven.rs`

---

### Phase 3: Backend Features (Wave 3)


- [x] 7. 缓存管理服务

  **What to do**:
  - 在 `services/cache.rs` 中实现缓存管理
  - 使用 Tauri 的 `app_data_dir()` 作为缓存目录
  - 实现 `download_and_cache(url)` 函数
  - 实现 `get_cached_path(id)` 函数
  - 实现简单的缓存清理（LRU 或按大小）
  - 编写单元测试

  **Must NOT do**:
  - 不实现复杂的缓存策略
  - 不实现后台预取

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 文件系统操作，逻辑直接
  - **Skills**: [`context7`]
    - `context7`: 查询 Tauri app_data_dir 用法

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 5, 6 后期)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 8
  - **Blocked By**: Task 4

  **References**:
  - Tauri path API: https://v2.tauri.app/reference/javascript/api/namespacepath/
  - dirs crate: https://docs.rs/dirs/5.0.1/dirs/

  **Cache Structure**:
  ```
  ~/Library/Application Support/com.wallpapermate.app/
  └── cache/
      ├── bing/
      │   └── 2024-01-28.jpg
      └── wallhaven/
          └── abc123.jpg
  ```

  **Acceptance Criteria**:
  
- [x] 测试通过: `cargo test services::cache`
  
- [x] 壁纸下载后保存到正确目录
  
- [x] 缓存路径可检索
  
- [x] 缓存清理功能可用

  **Commit**: YES
  - Message: `feat: 实现壁纸缓存管理服务`
  - Files: `src-tauri/src/services/cache.rs`

---


- [x] 8. Tauri Commands 层

  **What to do**:
  - 在 `commands/wallpaper.rs` 中定义 Tauri 命令
  - 实现 `fetch_next_wallpaper` 命令
  - 实现 `set_wallpaper` 命令
  - 实现 `get_settings` / `save_settings` 命令
  - 在 `lib.rs` 中注册命令
  - 编写集成测试

  **Must NOT do**:
  - 不在命令中实现业务逻辑（调用 services）
  - 不阻塞主线程（使用 async）

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 需要正确处理 Tauri IPC、async、状态管理
  - **Skills**: [`context7`]
    - `context7`: 查询 Tauri 2.0 命令定义最佳实践

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 10, 11, 12)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 9, 13
  - **Blocked By**: Tasks 4, 5, 6, 7

  **References**:
  - Tauri commands: https://v2.tauri.app/develop/calling-rust/
  - Async commands: 使用 `async fn` + `Result` 返回类型
  - State management: `tauri::State<Mutex<AppState>>`

  **Command Signatures**:
  ```rust
  #[tauri::command]
  async fn fetch_next_wallpaper(source: String) -> Result<WallpaperInfo, String>;

  #[tauri::command]
  async fn set_wallpaper(path: String) -> Result<(), String>;

  #[tauri::command]
  fn get_settings(state: State<AppState>) -> Settings;

  #[tauri::command]
  fn save_settings(state: State<AppState>, settings: Settings) -> Result<(), String>;
  ```

  **Acceptance Criteria**:
  
- [x] 所有命令在 `tauri::generate_handler![]` 中注册
  
- [x] 前端可通过 `invoke()` 调用命令
  
- [x] 错误正确返回到前端
  
- [x] `cargo test commands` 通过

  **Commit**: YES
  - Message: `feat: 实现 Tauri IPC 命令层`
  - Files: `src-tauri/src/commands/*.rs, src-tauri/src/lib.rs`

---


- [x] 9. System Tray 菜单栏

  **What to do**:
  - 在 Tauri setup hook 中创建 System Tray
  - 添加菜单项：下一张壁纸、打开设置、退出
  - 处理菜单点击事件
  - 使用占位符图标（16x16 PNG）
  - 编写测试

  **Must NOT do**:
  - 不实现暂停/恢复（无定时器）
  - 不实现状态指示器（MVP 简化）

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Tauri System Tray API 需要正确的生命周期管理
  - **Skills**: [`context7`]
    - `context7`: 查询 Tauri 2.0 System Tray 最新 API

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 14, 15)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 16
  - **Blocked By**: Task 8

  **References**:
  - Tauri System Tray: https://v2.tauri.app/learn/system-tray/
  - TrayIconBuilder API (from research)

  **Menu Structure**:
  ```
  [Tray Icon]
    ├── 下一张壁纸
    ├── ─────────── (分隔线)
    ├── 设置...
    └── 退出
  ```

  **Acceptance Criteria**:
  
- [x] 菜单栏图标显示
  
- [x] 点击"下一张壁纸"触发壁纸更换
  
- [x] 点击"设置..."打开设置窗口
  
- [x] 点击"退出"关闭应用

  **Manual Verification**:
  
- [x] `pnpm tauri dev` 启动后菜单栏显示图标
  
- [x] 右键/左键点击显示菜单
  
- [x] 各菜单项功能正常

  **Commit**: YES
  - Message: `feat: 实现 macOS 菜单栏 System Tray`
  - Files: `src-tauri/src/lib.rs, src-tauri/icons/*`

---

### Phase 4: Frontend (Wave 4)


- [x] 10. React 前端结构搭建

  **What to do**:
  - 创建前端目录结构（components, hooks, services, store, types）
  - 配置路径别名（@/）
  - 设置基础 Layout 组件
  - 配置 TypeScript 严格模式
  - 添加基础样式（TailwindCSS）

  **Must NOT do**:
  - 不创建具体业务组件（仅结构）
  - 不添加非必要依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准 React 项目结构
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 3, 4, 5, 6)
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 11, 12
  - **Blocked By**: Task 1

  **References**:
  - PRD 前端模块结构: `docs/PRD.md` (lines 237-243)
  - Vite path aliases: https://vitejs.dev/config/shared-options.html#resolve-alias

  **Directory Structure**:
  ```
  src/
  ├── components/
  │   ├── ui/           # shadcn/ui components
  │   └── layout/       # Layout components
  ├── hooks/
  ├── services/
  │   └── tauri.ts      # Tauri IPC wrappers
  ├── store/
  │   └── index.ts      # Zustand store
  ├── types/
  │   └── index.ts      # TypeScript types
  ├── App.tsx
  └── main.tsx
  ```

  **Acceptance Criteria**:
  
- [x] 目录结构创建完成
  
- [x] 路径别名 `@/` 可用
  
- [x] `pnpm dev` 启动无错误
  
- [x] TypeScript 编译通过

  **Commit**: YES
  - Message: `feat: 搭建 React 前端结构`
  - Files: `src/**/*.ts, src/**/*.tsx, tsconfig.json, vite.config.ts`

---


- [x] 11. Zustand 状态管理

  **What to do**:
  - 安装 Zustand
  - 创建 `store/wallpaper.ts` 管理壁纸状态
  - 创建 `store/settings.ts` 管理设置状态
  - 定义 actions 和 selectors
  - 编写单元测试

  **Must NOT do**:
  - 不使用 Redux 或其他状态库
  - 不过度设计 store 结构

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Zustand 使用简单，状态设计直接
  - **Skills**: [`context7`]
    - `context7`: 查询 Zustand 最佳实践

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 12)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 13
  - **Blocked By**: Task 10

  **References**:
  - Zustand docs: https://zustand-demo.pmnd.rs/

  **Store Structure**:
  ```typescript
  /* store/wallpaper.ts */
  interface WallpaperState {
    current: WallpaperInfo | null;
    loading: boolean;
    error: string | null;
    fetchNext: (source: Source) => Promise<void>;
    setWallpaper: (info: WallpaperInfo) => Promise<void>;
  }

  /* store/settings.ts */
  interface SettingsState {
    source: 'bing' | 'wallhaven';
    wallhavenApiKey: string | null;
    load: () => Promise<void>;
    save: () => Promise<void>;
  }
  ```

  **Acceptance Criteria**:
  
- [x] `pnpm add zustand` 完成
  
- [x] Store 文件创建并导出
  
- [x] 测试通过: `pnpm test store`
  
- [x] DevTools 集成可用（开发模式）

  **Commit**: YES
  - Message: `feat: 实现 Zustand 状态管理`
  - Files: `src/store/*.ts, src/__tests__/store/*.test.ts`

---


- [x] 12. shadcn/ui 组件库集成

  **What to do**:
  - 初始化 shadcn/ui（`pnpm dlx shadcn-ui@latest init`）
  - 添加必要组件：Button, Card, Input, Select, Toast
  - 配置主题（dark mode 支持）
  - 创建基础 UI 组件

  **Must NOT do**:
  - 不添加所有组件（按需添加）
  - 不自定义主题（使用默认）

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 组件集成需要关注视觉效果
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 确保 UI 组件正确集成

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 11)
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 14, 15
  - **Blocked By**: Task 10

  **References**:
  - shadcn/ui: https://ui.shadcn.com/docs/installation/vite
  - Components to add: Button, Card, Input, Select, Label, Separator, Sonner (toast)

  **Acceptance Criteria**:
  
- [x] `components.json` 配置完成
  
- [x] 必要组件添加: `pnpm dlx shadcn-ui@latest add button card input select`
  
- [x] 组件可在页面中使用
  
- [x] Toast 通知可触发

  **Commit**: YES
  - Message: `feat: 集成 shadcn/ui 组件库`
  - Files: `components.json, src/components/ui/*`

---


- [x] 13. Tauri IPC 服务层

  **What to do**:
  - 在 `services/tauri.ts` 中封装 Tauri invoke 调用
  - 实现 `fetchNextWallpaper(source)` 函数
  - 实现 `setWallpaper(path)` 函数
  - 实现 `getSettings()` / `saveSettings()` 函数
  - 添加类型安全
  - 编写单元测试（mock invoke）

  **Must NOT do**:
  - 不直接在组件中调用 `invoke`
  - 不忽略错误处理

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Tauri IPC 封装是标准模式
  - **Skills**: [`context7`]
    - `context7`: 查询 @tauri-apps/api 用法

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 12)
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 14, 15
  - **Blocked By**: Tasks 8, 11

  **References**:
  - Tauri invoke: https://v2.tauri.app/develop/calling-rust/

  **Service Interface**:
  ```typescript
  /* services/tauri.ts */
  import { invoke } from '@tauri-apps/api/core';

  export async function fetchNextWallpaper(source: Source): Promise<WallpaperInfo> {
    return invoke('fetch_next_wallpaper', { source });
  }

  export async function setWallpaper(path: string): Promise<void> {
    return invoke('set_wallpaper', { path });
  }
  ```

  **Acceptance Criteria**:
  
- [x] 所有后端命令有对应前端函数
  
- [x] 类型定义与后端一致
  
- [x] 测试通过（mock invoke）
  
- [x] 错误处理完整

  **Commit**: YES
  - Message: `feat: 实现 Tauri IPC 服务层`
  - Files: `src/services/tauri.ts, src/__tests__/services/*.test.ts`

---

### Phase 5: Integration (Wave 5)


- [x] 14. 设置界面 UI

  **What to do**:
  - 创建 Settings 页面/组件
  - 实现壁纸来源选择（Bing/Wallhaven）
  - 实现 Wallhaven API Key 输入
  - 实现保存/取消按钮
  - 编写组件测试

  **Must NOT do**:
  - 不实现更换频率设置（无定时器）
  - 不实现缓存清理 UI（MVP 简化）

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 组件开发，需要关注用户体验
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 确保设置界面直观易用

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 15)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 16
  - **Blocked By**: Tasks 12, 13

  **References**:
  - shadcn/ui Form patterns: https://ui.shadcn.com/docs/components/form

  **UI Layout**:
  ```
  ┌─────────────────────────────┐
  │ 设置                        │
  ├─────────────────────────────┤
  │ 壁纸来源                    │
  │ [Bing Daily ▼]              │
  │                             │
  │ Wallhaven API Key (可选)    │
  │ [________________________]  │
  │                             │
  │ [取消]           [保存]     │
  └─────────────────────────────┘
  ```

  **Acceptance Criteria**:
  
- [x] 设置界面可从菜单栏打开
  
- [x] 来源选择可切换
  
- [x] API Key 可输入并保存
  
- [x] 保存后设置持久化
  
- [x] 组件测试通过

  **Commit**: YES
  - Message: `feat: 实现设置界面 UI`
  - Files: `src/components/Settings.tsx, src/__tests__/components/*.test.tsx`

---


- [x] 15. 壁纸预览组件

  **What to do**:
  - 创建 WallpaperPreview 组件
  - 显示当前/预览壁纸缩略图
  - 显示壁纸信息（标题、来源）
  - 实现"设为壁纸"按钮
  - 编写组件测试

  **Must NOT do**:
  - 不实现壁纸浏览/列表（MVP 仅显示当前）
  - 不实现收藏功能

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 图片展示组件，需要良好的视觉效果
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 确保预览组件美观

  **Parallelization**:
  - **Can Run In Parallel**: YES (与 Task 14)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 16
  - **Blocked By**: Tasks 12, 13

  **References**:
  - Image optimization: 使用缩略图 URL 减少加载时间

  **Component Interface**:
  ```typescript
  interface WallpaperPreviewProps {
    wallpaper: WallpaperInfo | null;
    onSetWallpaper: () => void;
    loading: boolean;
  }
  ```

  **Acceptance Criteria**:
  
- [x] 组件正确显示壁纸图片
  
- [x] 加载状态显示 skeleton/spinner
  
- [x] "设为壁纸"按钮可点击
  
- [x] 组件测试通过

  **Commit**: YES
  - Message: `feat: 实现壁纸预览组件`
  - Files: `src/components/WallpaperPreview.tsx, src/__tests__/components/*.test.tsx`

---


- [x] 16. 端到端集成测试

  **What to do**:
  - 验证完整用户流程
  - 测试菜单栏功能
  - 测试设置保存/加载
  - 测试壁纸获取和设置
  - 修复发现的问题

  **Must NOT do**:
  - 不编写自动化 E2E 测试（手动验证）
  - 不测试边缘情况（MVP 核心流程）

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: 集成测试需要全局视角
  - **Skills**: [`playwright`]
    - `playwright`: 如需自动化 UI 测试

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (最后)
  - **Blocks**: Task 17
  - **Blocked By**: Tasks 9, 14, 15

  **Manual Test Checklist**:
  ```
  □ 启动应用，菜单栏图标显示
  □ 点击"下一张壁纸"，壁纸更换成功
  □ 点击"设置"，设置窗口打开
  □ 更改壁纸来源，保存设置
  □ 再次点击"下一张壁纸"，使用新来源
  □ 重启应用，设置保持
  □ 点击"退出"，应用关闭
  ```

  **Acceptance Criteria**:
  
- [x] 所有手动测试用例通过
  
- [x] 无控制台错误
  
- [x] 无 Rust panic
  
- [x] 性能可接受（壁纸获取 < 5s）

  **Commit**: YES
  - Message: `fix: 修复集成测试发现的问题`
  - Files: (depends on issues found)

---

### Phase 6: Polish (Wave 6)


- [x] 17. 文档和清理

  **What to do**:
  - 更新 README.md 添加使用说明
  - 在 docs/ 下创建技术文档
  - 清理未使用的代码和依赖
  - 添加代码注释（关键函数）
  - 验证 AGENTS.md 规范遵守

  **Must NOT do**:
  - 不写过度详细的文档
  - 不添加 JSDoc everywhere

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 文档编写任务
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 6 (最后)
  - **Blocks**: None
  - **Blocked By**: Task 16

  **Documents to Create**:
  - `docs/architecture.md` - 架构概述
  - `docs/development.md` - 开发指南
  - `docs/api.md` - Tauri 命令 API

  **Acceptance Criteria**:
  
- [x] README.md 更新，包含安装和使用说明
  
- [x] docs/ 下有技术文档
  
- [x] 无未使用的依赖（`pnpm prune`）
  
- [x] 关键函数有注释

  **Commit**: YES
  - Message: `docs: 添加技术文档和使用说明`
  - Files: `README.md, docs/*.md`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat: 初始化 Tauri 2.0 + React + Vite 项目` | package.json, src-tauri/*, src/* | pnpm tauri dev |
| 2 | `chore: 设置 Vitest 和 Rust 测试基础设施` | vitest.config.ts, tests/* | pnpm test |
| 3 | `feat: 搭建 Rust 后端模块结构` | src-tauri/src/**/*.rs | cargo build |
| 4 | `feat: 集成 wallpaper crate，实现壁纸设置功能` | src-tauri/src/services/wallpaper.rs | cargo test |
| 5 | `feat: 实现 Bing Daily Wallpaper API 服务` | src-tauri/src/sources/bing.rs | cargo test |
| 6 | `feat: 实现 Wallhaven API 服务` | src-tauri/src/sources/wallhaven.rs | cargo test |
| 7 | `feat: 实现壁纸缓存管理服务` | src-tauri/src/services/cache.rs | cargo test |
| 8 | `feat: 实现 Tauri IPC 命令层` | src-tauri/src/commands/*.rs | cargo test |
| 9 | `feat: 实现 macOS 菜单栏 System Tray` | src-tauri/src/lib.rs, icons/* | pnpm tauri dev |
| 10 | `feat: 搭建 React 前端结构` | src/**/*.ts, vite.config.ts | pnpm dev |
| 11 | `feat: 实现 Zustand 状态管理` | src/store/*.ts | pnpm test |
| 12 | `feat: 集成 shadcn/ui 组件库` | components.json, src/components/ui/* | pnpm dev |
| 13 | `feat: 实现 Tauri IPC 服务层` | src/services/tauri.ts | pnpm test |
| 14 | `feat: 实现设置界面 UI` | src/components/Settings.tsx | pnpm test |
| 15 | `feat: 实现壁纸预览组件` | src/components/WallpaperPreview.tsx | pnpm test |
| 16 | `fix: 修复集成测试发现的问题` | (varies) | pnpm tauri dev |
| 17 | `docs: 添加技术文档和使用说明` | README.md, docs/*.md | - |

---

## Success Criteria

### Verification Commands
```bash
pnpm install        # Expected: 依赖安装成功
pnpm test           # Expected: 所有 Vitest 测试通过
cargo test          # Expected: 所有 Rust 测试通过 (in src-tauri/)
pnpm tauri dev      # Expected: 应用启动，菜单栏图标显示
```

### Final Checklist

- [x] 菜单栏图标显示正常

- [x] "下一张壁纸"功能可用

- [x] Bing Daily 壁纸获取成功

- [x] Wallhaven 壁纸获取成功

- [x] 设置界面可打开

- [x] 设置保存后持久化

- [x] 所有测试通过

- [x] 文档完整

- [x] 代码符合 AGENTS.md 规范
