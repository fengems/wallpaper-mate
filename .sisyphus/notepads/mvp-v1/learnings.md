# MVP v1 - Learnings

此文件记录项目实施过程中的技术学习、约定和模式。

---

## [2026-01-28] 项目启动

### 技术栈决策
- 包管理器: pnpm
- 状态管理: Zustand
- 测试框架: Vitest (Frontend) + Rust built-in tests (Backend)
- UI 组件库: shadcn/ui

### 项目约定
- 代码风格: prettier 默认配置
- 函数长度: 不超过 48 行
- 局部变量: 不超过 5-10 个
- 提交规范: feat:, hotfix:, fix:, docs:, style:, refactor:, test:, chore:
- 文档更新: 每次代码变更必须更新 docs/

### 架构约定
- 前端: components/, hooks/, services/, store/, types/
- 后端: commands/, services/, sources/, utils/
- TDD 流程: RED → GREEN → REFACTOR

### 壁纸来源
- Bing Daily Wallpaper: 主要来源，零配置，中文化
- Wallhaven: 动漫壁纸，可选 API key，混合密钥模式

### Task 1 学习心得
- TailwindCSS 4.x 需要使用 `@tailwindcss/postcss` 而不是直接使用 `tailwindcss` 插件
- Tauri init 使用 `--ci` 参数可以跳过交互式提示
- 需要手动创建目录结构，即使 Tauri init 创建了部分目录
- 配置 identifier 为 `com.wallpapermate.app` 用于 macOS 应用识别

### Task 2 学习心得
- Vitest 4.x 使用 jsdom 作为环境，配置在 vitest.config.ts
- 测试 setup 文件可以配置 globals 和测试环境
- Rust 测试使用 `#[cfg(test)]` 模块和 `#[test]` 属性
- 需要确保 Rust 工具链已安装才能运行 cargo test

### Task 3 学习心得
- Rust 模块使用 `pub mod` 声明并在 mod.rs 中导出
- types 模块应该包含核心数据结构（WallpaperInfo, Source, Error）
- 使用 thiserror 创建自定义错误类型，便于错误处理
- 使用 serde::{Serialize, Deserialize} 来处理 JSON 序列化
- 创建空 stub 文件确保模块可以编译

### Task 14-15 学习心得
- UI 组件开发遇到 shadcn/ui 的类型系统问题
- Select 组件的 onValueChange 接收 (value: string) 而不是 (value: T) => void
- Button 组件支持 variant 和 size 属性，但 className 需要通过 cn 函数处理
- macOS window.close() 可关闭 Tauri 窗口
- TypeScript 类型定义使用 const export pattern 而非 enum
- 文件名大小写在问题会导致编译错误（Settings.tsx vs settings.tsx）

### Task 16-17 学习心得
- App.tsx 实现了基础的事件监听和状态管理
- 菜单栏事件通过 Tauri emit 触发
- 条件渲染支持 preview 和 settings 视图
- 简单的内联 UI 用于 MVP 验证

