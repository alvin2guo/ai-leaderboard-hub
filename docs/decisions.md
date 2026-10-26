# 架构与数据合规决策记录 (Architecture Decision Records)

本文档记录 **AI Leaderboard Hub** 项目的关键技术选型决策（ADR）、数据合规政策及反爬/授权边界处理原则。

---

## ADR-001: 技术栈选型为 Astro + TypeScript + Tailwind CSS

### 背景
项目目标是汇聚全球主流 AI 评测榜单并托管至 GitHub Pages。需要极高的访问速度、零后端基础设施维护成本、优秀的 SEO 以及优雅的暗色/亮色交互体验。

### 决策
- **框架：** 采用 **Astro 5 (SSG Static Site Generation)**。
- **样式：** Tailwind CSS。
- **语言：** TypeScript（Strict Mode）。
- **客户端搜索：** Fuse.js 纯客户端轻量模糊搜索。

### 结果与理由
1. **零服务端依赖：** 构建阶段完全生成纯 HTML/CSS，可直接部署在 GitHub Pages、Cloudflare Pages 或任何静态 CDN 上。
2. **卓越加载性能：** 无需昂贵的 React/Vue 全局运行时水合，只有交互局部（如对比筛选器和搜索框）执行按需脚本。
3. **CI/CD 简练：** 构建产物确定性高，数据有变动时触发 GitHub Actions 即可重新静态打包。

---

## ADR-002: 坚决不做跨榜加权总分与混合排序

### 背景
许多用户希望看到“全球大模型终极第一名”的综合单一打分榜单。

### 决策
**明确禁止且不在前端提供跨榜加权总分、不可比指标混排计算。**

### 结果与理由
1. **指标体系不可通约：**
   - LMSYS Chatbot Arena 基于成对盲测（Bradley-Terry 模型输出 Elo 积分，例如 1289 分）；
   - OpenCompass / SuperCLUE 基于预设数据集准确率（百分制，例如 75.8%）；
   - Artificial Analysis 评估综合吞吐速度（tps）与价格比；
   - Vectara 测量幻觉率（百分比，越低越好，例如 1.5%）；
   - MTEB 衡量向量检索召回度（Recall/NDCG）。
2. **选型真实性高于虚假简单：** 将不同目标、不同分布的数值强行按权重相加，会导致严重的误导并失去科学严谨性。
3. **替代方案：** 提供“模型跨榜对照页（`/compare`）”，让研发人员在一屏内横向对比同一模型在各评测维度的具体排名与原始分值。

---

## ADR-003: 榜单数据合规与采集适配器策略

### 背景
不同榜单发布机构的版权政策、API 开放度、robots.txt 规范以及反爬机制（如 Cloudflare Turnstile、动态 JavaScript 渲染）差异极大。

### 决策与各来源合规策略

| 来源 ID | 榜单名称 | 自动抓取支持 | 采集与更新决策说明 |
| :--- | :--- | :---: | :--- |
| `lmarena-chat` | LMSYS Chatbot Arena | ❌ 否 | 官方页面包含动态会话且依赖 Hugging Face Space 前端渲染。为遵守其条款并避免对其计算资源产生非必要负载，采用**社区验证的人工快照提交**机制。 |
| `opencompass-overall` | OpenCompass 司南能力榜 | ❌ 否 | 官方定期发布基准阶段性评测快照与学术报告。采用**人工核验快照**，附注官方链接与报告日期。 |
| `superclue-general` | SuperCLUE 中文通用基准 | ❌ 否 | 官方按月度/季度发布权威中文测评榜单，采用**快照归档模式**。 |
| `artificial-analysis` | Artificial Analysis | ❌ 否 | 商业分析平台，前端设有服务协议与防护机制。严格尊重其条款，仅存储公开宣传引用的必要元数据快照，注明原出处。 |
| `openrouter-rankings` | OpenRouter Top Models | ✅ 是 | 提供官方开放 API（`/api/v1/models`）与公开模型统计，通过 `OpenRouterAdapter` 脚本由 GitHub Actions 定时同步。 |
| `huggingface-allbench` | HF Open LLM Leaderboard | ❌ 否（MVP期） | 数据存储于 Hugging Face Datasets，MVP 阶段人工核验快照，第二阶段支持基于 datasets API 自动化抓取。 |
| `vectara-hallucination` | Vectara 幻觉基准榜 | ❌ 否 | 垂直专项基准，更新频率相对较低，采用**人工核查快照**。 |
| `mteb-retrieval` | MTEB 文本嵌入基准 | ❌ 否 | 榜单模型体量极大且任务分类细，采用定期归纳核心 Retrieval 指标快照。 |
| `awesome-llm-eval` | Awesome-LLM-Eval 目录 | ❌ 否 | 作为开源项目导航与资源库索引（`category: directory`），不收录具体模型打分。 |

### 采集安全底线
1. 严禁使用无头浏览器强行破解或绕过任何反爬人机验证系统；
2. 自动化拉取必须配置自定义 `User-Agent`，遵守合理的请求限频（Rate Limiting）；
3. 抓取任务失败时，**严格保留上一期历史有效快照**，绝不覆写错误数据。

---

## ADR-004: GitHub Pages 部署与子路径保护

### 背景
GitHub Pages 项目站通常部署在子路径（如 `https://<user>.github.io/<repo>/`），静态站中若存在硬编码绝对路径（如 `/compare` 或 `/favicon.svg`），会导致 404 错误。

### 决策
1. 在 `astro.config.mjs` 中动态获取环境变量 `BASE_URL` 与 `GITHUB_REPOSITORY`，自动生成正确的 base path；
2. 内部链接统一使用包装方法或 `${import.meta.env.BASE_URL}` 前缀；
3. GitHub Actions 部署工作流中接入官方 `actions/configure-pages@v5` 与 `actions/deploy-pages@v4`，确保子路径与自定义域名无缝兼容。
