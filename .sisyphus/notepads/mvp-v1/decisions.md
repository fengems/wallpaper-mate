# MVP v1 - Decisions

此文件记录项目实施过程中的关键决策。

---

## [2026-01-28] 初始决策

### 技术选择
1. **pnpm**: 更快的安装速度，磁盘效率高
2. **Zustand**: 轻量级状态管理，DevTools 支持好
3. **TDD**: 使用 RED-GREEN-REFACTOR 流程
4. **Bing + Wallhaven**: 不使用 Unsplash，偏好中文化和动漫风格

### 范围决策
1. **MVP 范围**: 菜单栏 + 手动换壁纸 + 单一来源
2. **延后功能**: 定时器、启动/唤醒事件、历史记录、收藏
3. **多显示器**: MVP 仅支持主显示器
4. **API 密钥**: 混合模式（默认密钥 + 用户可覆盖）
5. **应用图标**: 使用占位符，后续替换

### 缓存策略
- 缓存目录: `~/Library/Application Support/com.wallpapermate.app/cache/`
- 缓存结构: 按来源分目录 (bing/, wallhaven/)
- 缓存清理: 简单 LRU 策略，无后台预取
