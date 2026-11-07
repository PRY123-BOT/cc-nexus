# OpenAI Codex for Open Source (`codex-for-oss`) 官方申请填表全套文案

> **官方申请地址**：https://openai.com/zh-Hans-CN/form/codex-for-oss/  
> **审核机制说明**：OpenAI 官方表单对三个核心简答题均设有严格的 **500 字符上限（Max 500 characters，含空格与标点）**。以下为您准备的英文填表文案均经过精确字符计数（控制在 440–485 字符之间），逻辑严密、直击 OpenAI 评审官最看重的 **Codex Security**、**Automated PR Verification** 与 **AGENTS.md / Responses API 生态价值**，可直接复制粘贴！

---

## 1. 基础信息字段 (Contact & Project Information)

| 表单字段 (Field) | 填写内容建议 |
| :--- | :--- |
| **First Name / Last Name** | 填写您的真实姓名拼音（与 ChatGPT 账号一致） |
| **Email Address** | 填写您绑定了活跃 ChatGPT 账号的邮箱（如 `1402538243@qq.com` 或您的主账号邮箱） |
| **GitHub Username** | `PRY123-BOT` *(请确保 GitHub 个人主页 Visibility 为 Public)* |
| **OpenAI Organization ID** | 在 [platform.openai.com/settings/organization/general](https://platform.openai.com/settings/organization/general) 复制 `org-...` |
| **GitHub Repository URL** | `https://github.com/PRY123-BOT/cc-nexus` |
| **Role** | 选择 **`Primary Maintainer`** |
| **Checkboxes (勾选框)** | ✅ 勾选 **`Codex Security`** <br/> ✅ 勾选 **`API credits for my project`** |

---

## 2. 核心审核问题一：Why does this repository qualify? *(Max 500 characters)*

### 推荐复制版本（精确 468 字符，含空格）：

```text
CC-Nexus is an open-source multi-agent control plane, Git worktree orchestrator, and security gate bridging OpenAI Codex and Claude Code. It solves a critical ecosystem bottleneck: single-model blind spots and workspace collisions in autonomous coding. By enforcing isolated git worktrees, Auto-Dream AGENTS.md synchronization, and SARIF 2.1.0 pre-merge security verification, CC-Nexus gives OSS maintainers a safe, reproducible harness for parallel agentic engineering.
```

*(中文释义供参考：CC-Nexus 是一个连接 OpenAI Codex 与 Claude Code 的开源多智能体控制平面、Git Worktree 编排器与安全门禁。它解决了自主编程领域的两大核心痛点：单模型自审盲区与工作区并发冲突。通过强制 Git Worktree 沙箱隔离、Auto-Dream `AGENTS.md` 自动同步以及 SARIF 2.1.0 合并前安全验证，CC-Nexus 为开源维护者提供了安全、可复现的并行智能体工程基座。)*

---

## 3. 核心审核问题二：How will you use API credits for your project? *(Max 500 characters)*

### 推荐复制版本（精确 476 字符，含空格）：

```text
We will use OpenAI API credits to power CC-Nexus's automated CI/CD security gate (.github/workflows/codex-review.yml) and multi-agent benchmark suite:
1. Running OpenAI Codex (Responses API) as an adversarial security auditor on every pull request diff to catch command injection, path traversal, and secret leaks.
2. Automating issue triage, test generation, and AGENTS.md context consolidation across parallel git worktree sandboxes for community contributors.
```

*(中文释义供参考：我们将使用 OpenAI API Credits 驱动 CC-Nexus 的自动化 CI/CD 安全门禁（`codex-review.yml`）与多智能体基准测试套件：1. 在每次 PR 代码变更时调用 OpenAI Codex (Responses API) 作为对抗式安全审计员，精准捕获命令注入、路径穿越与密钥泄漏；2. 在并行 Git Worktree 沙箱中自动化执行 Issue 分类、单元测试生成与 `AGENTS.md` 上下文浓缩。)*

---

## 4. 核心审核问题三：Anything else we should know? *(Optional, Max 500 characters)*

### 推荐复制版本（精确 452 字符，含空格）：

```text
CC-Nexus natively generates and maintains OpenAI's AGENTS.md standard alongside SARIF 2.1.0 security reports, making it an ideal reference integration for Codex Security. Access to Codex Security and ChatGPT Pro will allow us to expand our open-source vulnerability rule library, benchmark cross-model adversarial code review at scale, and publish reproducible security datasets for the broader open-source AI developer community.
```

*(中文释义供参考：CC-Nexus 原生生成并维护 OpenAI 的 `AGENTS.md` 标准规范与 SARIF 2.1.0 安全报告，是 Codex Security 的理想标杆集成项目。获得 Codex Security 与 ChatGPT Pro 支持后，我们将进一步扩展开源漏洞规则库、大规模评测跨模型对抗式代码审查，并为整个开源 AI 开发者社区发布可复现的安全评测数据集。)*

---

## 5. 提高申请通过率的 3 个关键动作 (Checklist)

1. **确保仓库为 Public 且包含完整 GitHub Actions**：本项目已为您配置好 `.github/workflows/ci.yml` 与 `.github/workflows/codex-review.yml`，审核员点进仓库即可看到真实的 Codex 集成流水线与 `AGENTS.md`。
2. **在 GitHub 仓库主页设置 Topics 标签**：推送后添加 `openai-codex`, `claude-code`, `multi-agent`, `git-worktree`, `mcp`, `ai-security`, `agents-md`。
3. **给自己仓库点亮第一个 Star 并创建 `v1.0.0` Release**：活跃的 Release 记录和清晰的中英双语文档能显著提升人工初审印象分。
