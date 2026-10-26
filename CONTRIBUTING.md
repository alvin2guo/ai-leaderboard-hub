# 贡献指南 (Contributing Guide)

感谢您关注并愿意为 **AI Leaderboard Hub** 贡献力量！本项目致力于建立一个开放、客观、无偏见且百分之百可溯源的全球 AI 大模型评测快照聚合库。

在开始贡献之前，请仔细阅读以下规范。

---

## 核心准则与红线

1. **绝对禁止伪造或编造数据：** 所有上榜模型、分数、名次与指标必须来自公开可查的官方渠道；
2. **严禁混排加权：** 各榜单测评维度不同，不得在同一个快照中强行把不同来源指标混杂平均；
3. **强制提供追溯链：** 每一份快照必须提供原始网址 `source_url` 与采集日期 `snapshot_date`；
4. **遵守合法合规底线：** 不得使用暴力爬虫强行绕过反爬、验证码或违反目标网站的服务条款。

---

## 本地开发快速上手

本项目基于 Node.js 20+ 与 Astro 5 构建，无需配置外部数据库：

```bash
# 1. 克隆代码仓库
git clone https://github.com/alvin2guo/ai-leaderboard-hub.git
cd ai-leaderboard-hub

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器（支持热重载）
npm run dev

# 4. 执行数据合规与完整性校验（提交 PR 前必须执行）
npm run validate:data

# 5. 执行单元与集成测试
npm run test

# 6. 本地静态构建测试
npm run build
```

---

## 如何新增一个评测榜单来源

### 第一步：在 `data/sources.yml` 中追加来源定义

```yaml
- id: your-leaderboard-id # 唯一英文字符串，使用短横线命名，如 "livecodebench"
  name: LiveCodeBench # 官方榜单名称
  category: specialized # 可选：arena, comprehensive, chinese, specialized, directory
  modality: code # 可选：text, multimodal, code, embedding, audio, all
  url: https://livecodebench.github.io/ # 官方网站 URL
  description: 针对大模型代码生成与自修复能力的实时防污染基准。 # 简短介绍
  ranking_type: benchmark # 可选：elo, benchmark, human_eval, win_rate, cost_quality, curated_list
  metrics: # 指标列表
    - Pass@1
    - CodeContest Score
  license_or_terms_url: https://github.com/LiveCodeBench/LiveCodeBench # 许可或条款链接
  last_checked_at: '2026-10-25' # ISO 8601 日期 (YYYY-MM-DD)
  update_frequency: weekly # 可选：daily, weekly, bi-weekly, monthly, manual
  auto_fetch_supported: false # 是否已实现自动化拉取
  notes: 评测题目每月持续动态更新，严格防止模型训练集泄露。 # 补充说明
```

### 第二步：在 `data/rankings/` 下提供初始快照文件

创建 `data/rankings/[your-leaderboard-id].json`：

```json
{
  "source_id": "your-leaderboard-id",
  "snapshot_date": "2026-10-25",
  "source_url": "https://livecodebench.github.io/leaderboard.html",
  "raw_notes": "基于 2026 年 10 月最新发布的问题集合跑分。",
  "models": [
    {
      "rank": 1,
      "model_name": "Claude 3.5 Sonnet (20241022)",
      "normalized_model_name": "claude-3-5-sonnet",
      "organization": "Anthropic",
      "score": 53.7,
      "metrics": {
        "Pass@1": 53.7
      },
      "notes": "中等与困难题目表现突出"
    }
  ]
}
```

> **注意：** `normalized_model_name` 应尽量遵循项目既有的命名约定（例如 `gpt-4o`、`claude-3-5-sonnet`、`qwen2.5-72b-instruct`、`deepseek-v2.5` 等），以便系统能在跨榜对比页面自动完成对齐。

### 第三步：运行校验

```bash
npm run validate:data
npm run test
```

若有任何格式或必填字段遗漏，校验工具将直接提示具体报错行。

---

## 如何贡献自动更新适配器 (Adapter)

对于提供官方 API 或公开 JSON/CSV 接口的来源，欢迎在 `scripts/fetch/` 目录下编写适配器：

1. 继承 `BaseAdapter` 抽象类；
2. 实现 `fetchSnapshot(): Promise<RankingSnapshot>` 方法；
3. 处理网络超时、速率限制与错误回退（网络错误时**切勿**覆写旧快照）；
4. 在 `scripts/fetch/run-adapters.ts` 中注册您的适配器。

---

## 提交 PR (Pull Request) 流程

1. Fork 本仓库并基于 `master` 创建特性分支（如 `feat/add-livecodebench` 或 `fix/update-lmarena-snapshot`）；
2. 做出修改并确保 `npm run validate:data` 与 `npm run test` 本地通过；
3. 遵循 Conventional Commits 提交信息（例如 `feat(data): add livecodebench source snapshot`）；
4. 发起 Pull Request，维护者通常会在 24~48 小时内完成审查并合并。
