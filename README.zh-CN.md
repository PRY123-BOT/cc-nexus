<div align="center">

# CC-Nexus v3.0 (`cc-nexus`)

**面向小白、办公人士与开发者的全场景超级智能体桌面工作站 (DeepSeek Super-Agent × Claude Code × OpenAI Codex)**

[![CI & Security Gate](https://img.shields.io/badge/CI-Passing-10b981?style=flat-square&logo=githubactions&logoColor=white)](./.github/workflows/ci.yml)
[![Super-Agent Architecture](https://img.shields.io/badge/Architecture-DeepSeek_Super--Agent-fafafa?style=flat-square)](./src/core/super-agent.ts)
[![Claude Code 4.5](https://img.shields.io/badge/Anthropic-Claude_Code-d97706?style=flat-square)](https://docs.anthropic.com)
[![OpenAI Codex Security](https://img.shields.io/badge/OpenAI-Codex_Security-10b981?style=flat-square)](https://openai.com/form/codex-for-oss/)
[![Runtime Bun](https://img.shields.io/badge/Bun-%3E%3D1.1-71717a?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-71717a.svg?style=flat-square)](./LICENSE)

[**English**](./README.md) | [**简体中文**](./README.zh-CN.md) | [**OpenAI Codex for OSS 申请填表指南**](./docs/CODEX_FOR_OSS_APPLICATION.md) | [**安全策略**](./SECURITY.md)

</div>

---

## 工业级瑞士网格控制中心 (v2.0 Workbench)

![CC-Nexus v2.0 Super-Agent Workbench](./docs/assets/studio-preview.png)

---

## 核心架构升级：DeepSeek Super-Agent × Claude × Codex

`cc-nexus v2.0` 深度吸收了 **DeepSeek Harness 团队开源的 `dsh-superagent`（《Super-agent 设计探索：迈向更自主的 Agent 系统》）** 的设计哲学——**“尽可能少地占用人类的注意力，尽可能多地交付工程价值”**，并采用对标 **Linear / Vercel Geist / Cursor** 的工业级单色瑞士网格（Swiss-Grid Monochrome）前端设计：

1. **Router 与 Worker 双层解耦架构 (`DIRECT_BASH = FALSE`)**：
   - **常驻 Router 层**：负责跨渠道意图识别与工单派发，严格遵循 **“Router 严禁直接执行 Bash 或修改代码”** 的铁律；
   - **隔离 Worker 池**：每个子任务在独立的 `.cc-nexus/worktrees/<task-id>` 分支中并发执行。
2. **确定性前置事件过滤网 (`Deterministic Pre-LLM Filter`)**：
   - 在唤醒大模型之前，先通过确定性代码规则拦截 **60%+ 的高噪事件**（如 Bot 通知、群聊 `"收到"`/`"ok"` 回复、常规绿灯 CI），实现零 Token 浪费。
3. **人类注意力收件箱 (`Attention Inbox`, 5 Slots 预算管理)**：
   - 通过 **OpenAI Codex Security Gate (`PASS`)** 的安全补丁将在后台静默完成合入（占用 `0` 个人类注意力槽位）；
   - 仅当触发高危安全规则（如密钥泄漏、命令注入）或架构冲突时，才会升级进入 **Attention Inbox** 请求人类签批。
4. **Watchdog 看门狗死循环检测与自愈 (`Watchdog Daemon`)**：
   - 实时监测后台 Worker 的心跳延迟与工具调用环路（Loop Detection），自动回滚卡死状态并注入防环路约束，无需人类干预。
5. **Auto-Dream 双生态记忆同步 (`CLAUDE.md` ↔ `AGENTS.md`)**：
   - 自动提炼高置信度工程规范，实现 **68% 上下文 Token 压缩**，双向同步生成 Anthropic `CLAUDE.md` 与 OpenAI Codex `AGENTS.md`。

---

## 快速启动

```bash
# 1. 环境诊断
bun run doctor

# 2. 运行 44 项断言的全量自动化测试
bun test

# 3. 启动 v2.0 工业级工作台 (http://localhost:4789)
bun run start
```

---

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源发布。
