# MVP v1 - Issues

此文件记录项目实施过程中的问题和解决方案。

---

## [2026-01-28] Rust 环境问题

### 问题
- cargo 命令不可用，Rust 没有安装
- 无法运行 `cargo test` 来测试 Rust 代码

### 影响
- Task 2 的 Rust 测试部分无法验证
- 但 Vitest 测试已成功配置并运行通过

### 解决方案
- 需要安装 Rust 工具链
- Tauri 应该会自动处理 Rust 编译