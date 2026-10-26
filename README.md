# AI Leaderboard Hub 🏆

> 聚合全球主流 AI 大模型权威评测榜单，客观中立、拒绝编造、全量可追溯的开源评测与选型中心。

[![Deploy to GitHub Pages](https://github.com/alvin2guo/ai-leaderboard-hub/actions/workflows/deploy.yml/badge.svg)](https://github.com/alvin2guo/ai-leaderboard-hub/actions/workflows/deploy.yml)
[![Data Validation](https://img.shields.io/badge/Schema-JSON%20Schema%20Valid-emerald.svg)](https://github.com/alvin2guo/ai-leaderboard-hub)
[![Vitest](https://img.shields.io/badge/Tests-Vitest%20%2B%20Playwright-blue.svg)](https://github.com/alvin2guo/ai-leaderboard-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/alvin2guo/ai-leaderboard-hub/blob/master/CONTRIBUTING.md)

---

## 🌟 项目初衷与核心原则

大语言模型（LLM）层出不穷，各评测榜单百家争鸣。然而，各家指标体系大相径庭（Elo 盲测对决、多学科综合基准、推理速度/价格比、幻觉率、检索召回等）。

**AI Leaderboard Hub** 致力于提供一个纯静态、完全透明且可直接追溯的聚合中心。我们恪守以下铁律：

1. **绝对不伪造、不编造数据：** 所有跑分和排名均提取自公开报告或授权页面，坚决杜绝任何人工注水。
2. **坚决不做跨榜加权总分混排：** 拒绝将 Elo 积分、百分比准确率与幻觉率强行合成加权平均分，避免误导技术选型。
3. **百分之百出处可溯源：** 每条快照明确标注官方来源 URL、采集日期（`snapshot_date`）与版本口径。
4. **遵守合法合规与服务条款：** 不使用暴力爬虫绕过防护机制；对未开放接口的来源采取开源 Pull Request 人工审核录入。
5. **代码开源与数据版权明确：** 代码基于 **MIT 协议** 开源；评测数据版权归各原始机构所有。

---

## 📊 首期收录权威榜单矩阵

| 榜单 ID | 评测机构 / 名称 | 分类 | 模态 | 核心评测机制与指标 | 官方原站链接 | 许可 / 条款 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `opencompass-overall` | 上海 AI 实验室 OpenCompass | 中文综合基准 | 文本 | 语言、知识、推理、数学、代码能力综合分 | [官网](https://opencompass.org.cn/leaderboard-llm) | [条款](https://opencompass.org.cn/home) |
| `superclue-general` | SuperCLUE 中文通用基准 | 中文基准 | 文本 | 基础能力、专业能力、应用能力十大维度 | [官网](https://www.superclueai.com/) | [条款](https://www.superclueai.com/) |
| `artificial-analysis` | Artificial Analysis | 综合选型 | 文本 | Intelligence Index 智能指数、吐字速度、任务成本 | [官网](https://artificialanalysis.ai/leaderboards/models) | [条款](https://artificialanalysis.ai/terms) |
| `openrouter-rankings` | OpenRouter Top Models | 综合热度 | 全模态 | 开发者真实 Token 消耗量排名、调用增长率 | [官网](https://openrouter.ai/rankings) | [条款](https://openrouter.ai/terms) |
| `huggingface-allbench` | Hugging Face Open LLM v2 | 综合基准 | 文本 | IFEval, BBH, MATH L5, GPQA, MuSR, MMLU-PRO | [官网](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) | [条款](https://huggingface.co/terms-of-service) |
| `vectara-hallucination` | Vectara 幻觉基准 | 垂直专项 | 文本 | Hallucination Rate 幻觉率、事实一致性 | [官网](https://huggingface.co/spaces/vectara/leaderboard) | [开源基准](https://github.com/vectara/hallucination-leaderboard) |
| `mteb-retrieval` | MTEB 文本嵌入基准 | 垂直专项 | 向量 | Mean Task Score、Retrieval 检索、分类、STS | [官网](https://huggingface.co/spaces/mteb/leaderboard) | [条款](https://huggingface.co/spaces/mteb/leaderboard) |

---

## 🛠️ 技术选型与项目架构

```text
ai-leaderboard-hub/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml              # CI/CD 强校验与 GitHub Pages 部署
│   │   └── update-data.yml         # 定时数据拉取与快照更新工作流
│   └── ISSUE_TEMPLATE/             # 申请新榜单、数据纠错与功能建议模板
├── data/
│   ├── sources.yml                 # 榜单来源元数据定义
│   ├── rankings/                   # 独立结构化快照 JSON (7 权威数据源)
│   │   ├── opencompass-overall.json
│   │   └── ...
│   └── schema/                     # JSON Schema 校验规范
│       ├── source.schema.json
│       └── ranking.schema.json
├── scripts/
│   ├── validate-data.ts            # Ajv 编译期强 Schema 校验脚本
│   └── fetch/                      # 适配器基类与自动化抓取模块
│       ├── base-adapter.ts
│       ├── openrouter-adapter.ts
│       └── run-adapters.ts
├── src/
│   ├── layouts/Layout.astro        # 统一响应式布局与 SEO/OG 规范
│   ├── components/                 # 导航栏、声明栏、卡片组件
│   └── pages/
│       ├── index.astro             # 首页总览与客户端模糊检索
│       ├── sources/[id].astro      # 动态静态路由：榜单详情与指标说明
│       ├── compare.astro           # 多模型跨榜横向客观对照
│       ├── status.astro            # 数据源健康监控与快照状态公示
│       └── about.astro             # 收录准则、免责协议与 MIT 许可
├── tests/
│   ├── schema.test.ts              # Vitest 数据合规单元测试
│   ├── data.test.ts                # Vitest 核心业务工具测试
│   └── e2e/smoke.spec.ts           # Playwright 端到端冒烟测试
├── docs/
│   ├── decisions.md                # 架构设计与合规决策 (ADR)
│   └── roadmap.md                  # 后续迭代路线图
├── astro.config.mjs                # Astro 静态配置 (支持 GitHub Pages 子路径)
├── tailwind.config.mjs             # Tailwind CSS 样式配置
└── package.json
```

---

## 🚀 10 分钟快速上手指南

### 1. 环境准备
确保本机安装了 Node.js 20+ 以及 npm。

### 2. 克隆与安装依赖
```bash
git clone https://github.com/alvin2guo/ai-leaderboard-hub.git
cd ai-leaderboard-hub
npm install
```

### 3. 启动本地开发预览
```bash
npm run dev
```
打开浏览器访问 `http://localhost:4321` 即可体验。

### 4. 运行全量数据校验与测试
```bash
# 验证 data/ 下所有 YAML 与 JSON 必须符合 Schema
npm run validate:data

# 运行单元测试
npm run test

# 运行 Playwright 浏览器冒烟测试
npm run test:e2e

# 生产环境静态打包测试
npm run build
```

---

## 🤝 如何提交数据贡献

欢迎社区共同丰富和校准数据：

1. **申请收录新榜单：** 提交 [➕ 新榜单申请 Issue](https://github.com/alvin2guo/ai-leaderboard-hub/issues/new?template=01_new_source.yml)，或发起 PR 修改 `data/sources.yml`；
2. **提交最新快照：** 修改 `data/rankings/[source-id].json`，补充官方来源 `source_url` 和 `snapshot_date`；
3. **编写自动适配器：** 继承 `scripts/fetch/base-adapter.ts`，为符合授权要求的 API 编写拉取器；
4. 详见完整的 [贡献指南 (CONTRIBUTING.md)](CONTRIBUTING.md)。

---

## 🌐 GitHub Pages 部署说明

本项目通过 GitHub Actions 自动化部署：

1. 在 GitHub 仓库设置中，进入 **Settings > Pages**；
2. 在 **Build and deployment > Source** 中，选择 **GitHub Actions**；
3. 推送代码至 `master` 分支，`.github/workflows/deploy.yml` 自动运行并部署至 GitHub Pages；
4. `astro.config.mjs` 会自动依据 `GITHUB_REPOSITORY` 环境解析子路径（如 `/ai-leaderboard-hub/`），防止静态资源 404。

---

## ⚖️ 免责声明与版权

- **软件代码：** 采用 [MIT License](LICENSE) 开源。
- **评测数据：** 知识产权与商标权归各原始发布机构（LMSYS Org, Shanghai AI Lab, SuperCLUE Team, Artificial Analysis, Hugging Face, Vectara 等）所有。本项目仅出于技术研究与选型参考目的收录公开元数据。
- **免责声明：** 页面所有排名及分数仅供参考，不构成任何商业决策或采购承诺。请开发者以实际场景测试效果为最终依据。
