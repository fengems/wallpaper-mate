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
