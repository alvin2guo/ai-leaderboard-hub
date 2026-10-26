# AI Leaderboard Hub 迭代路线图 (Roadmap)

本项目采用模块化、开源共建的演进方式。以下为规划中的版本迭代与关键功能演进路线：

---

## 阶段一：核心 MVP（已交付当前版本 v0.1.0）
- [x] **基础设施搭建：** Astro 5 + TypeScript (Strict) + Tailwind CSS 纯静态生成体系；
- [x] **标准化数据模型：** 定义 JSON Schema（`source.schema.json`、`ranking.schema.json`），实现严苛的编译前校验脚本；
- [x] **权威榜单收录：** 覆盖 9 大主流来源（竞技场、综合基准、中文基准、幻觉基准、嵌入检索基准及评测导航），录入 100% 真实快照；
- [x] **核心浏览界面：** 首页分类过滤、快速搜索、榜单详情快照表、模型跨榜客观对照页；
- [x] **数据可信与溯源：** 声明出处链接、快照时间戳、明确提示“不进行跨榜加权混排”；
- [x] **CI/CD 与 GitHub Pages 部署：** 自动化测试、自动化校验与持续部署流水线；
- [x] **开源贡献规范：** 提供 MIT License、详细的 CONTRIBUTING 与标准化 Issue 模板。

---

## 阶段二：可视化与交互深化 (v0.2.0 - 2026 Q4)
- [ ] **多维雷达对照图：** 为具备细分多指标的榜单（如 OpenCompass 的语言/知识/推理/数学/代码，HF v2 的 IFEval/BBH/MATH）接入轻量 ECharts / 原生 SVG 雷达图；
- [ ] **对比报告导出功能：** 支持一键将选定模型的跨榜对照数据导出为 Markdown 表格、CSV 或精美分享长图；
- [ ] **高级检索与筛选器：** 支持复合筛选（如“开源权重模型”、“特定上下文长度 > 128k”、“支持 API 调用”）；
- [ ] **历史快照回溯与版本对比：** 记录同一榜单在不同时期的历史 JSON 快照，展示模型排名升降变动趋势（Trending delta）。

---

## 阶段三：自动化适配器矩阵扩展 (v0.3.0 - 2027 Q1)
- [ ] **Hugging Face Datasets 适配器：** 利用官方公开 Hugging Face Datasets API 自动抓取 Open LLM Leaderboard v2 与 MTEB 最新评测跑分；
- [ ] **OpenCompass 学术评测自动化：** 追踪 OpenCompass 开放数据集镜像，自动生成更新变更集；
- [ ] **自动 PR 生成机器人：** 定时更新任务在检测到上游官方榜单更新后，自动发起格式化的 Pull Request，由维护者点击确认合并，进一步提升数据时效性与安全性；
- [ ] **断言告警通知：** 榜单字段变更或抓取异常时，自动触发 GitHub Issue 或 Webhook 通知维护团队。

---

## 阶段四：垂直生态与开发者徽章 (v1.0.0 - 2027 Q2)
- [ ] **新增专业赛道子榜：**
  - **代码与推理专项：** LiveCodeBench, SWE-bench Verified;
  - **超长上下文专项：** RULER, Needle In A Haystack;
  - **安全与对齐专项：** SafetyBench, AdvGLUE;
  - **多模态与视觉推理：** MMBench, MathVista, Video-ChatGPT.
- [ ] **开源徽章生成服务 (Shields.io Badges)：** 允许模型开发者在自己的 GitHub README 中引用 AI Leaderboard Hub 动态排名徽章；
- [ ] **国际化多语言支持：** 支持简中/繁中/英文无缝切换。
