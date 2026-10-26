import { chromium } from '@playwright/test';
import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class OpenCompassAdapter extends BaseAdapter {
  readonly sourceId = 'opencompass-overall';
  readonly sourceUrl = 'https://opencompass.org.cn/leaderboard-llm';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[OpenCompassAdapter] Launching headless browser to scrape live table from opencompass.org.cn/leaderboard-llm...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1400, height: 900 }
    });

    const page = await context.newPage();
    try {
      await page.goto(this.sourceUrl, { timeout: 45000, waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.ant-table-row', { state: 'attached', timeout: 25000 });
      // Give table a moment to render
      await page.waitForTimeout(3000);

      const rowsData = await page.locator('.ant-table-row').evaluateAll(rows => {
        return rows.map(tr => {
          const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
          return cells;
        });
      });

      console.log(`[OpenCompassAdapter] Extracted ${rowsData.length} raw table rows from DOM.`);

      const models: ModelRankingItem[] = [];
      let rankCounter = 1;

      for (const cells of rowsData) {
        if (!cells || cells.length < 8) continue;

        // Structure of row:
        // [0] Index/Rank (or empty checkbox/rank)
        // [1] Model name & org: e.g. "Claude Opus 5 (high)\n闭源 · Anthropic"
        // [2] Release date: e.g. "2026/7/24"
        // [3] Type: e.g. "对话"
        // [4] Param size: e.g. "N/A" or "2.4T"
        // [5] 均分: e.g. "83.3"
        // [6] 知识: e.g. "94.1"
        // [7] 推理: e.g. "68.4"
        // [8] 数学: e.g. "77.3"
        // [9] 代码: e.g. "93.3"
        const modelCell = cells[1] || '';
        const lines = modelCell.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        const modelName = lines[0];
        const orgLine = lines[1] || '';
        const orgMatch = orgLine.match(/(?:闭源|开源)\s*·\s*(.+)/);
        const org = orgMatch ? orgMatch[1].trim() : (orgLine || 'Unknown');

        const releaseDate = cells[2] || '';
        const score = parseFloat(cells[5]);
        if (isNaN(score)) continue;

        const knowledge = parseFloat(cells[6]) || 0;
        const reasoning = parseFloat(cells[7]) || 0;
        const math = parseFloat(cells[8]) || 0;
        const code = parseFloat(cells[9]) || 0;

        const normalized = modelName
          .toLowerCase()
          .replace(/[^a-z0-9\.\-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        models.push({
          rank: rankCounter++,
          model_name: modelName,
          normalized_model_name: normalized,
          organization: org,
          score,
          metrics: {
            '均分': score,
            '知识': knowledge,
            '推理': reasoning,
            '数学': math,
            '代码': code,
            '发布日期': releaseDate
          },
          notes: `发布时间: ${releaseDate}, 研发机构: ${org}`
        });

        if (models.length >= 15) break;
      }

      if (models.length === 0) {
        throw new Error('Failed to parse any valid models from OpenCompass DOM table');
      }

      return {
        source_id: this.sourceId,
        snapshot_date: today,
        source_url: this.sourceUrl,
        raw_notes: `通过 Playwright 无头浏览器模拟真实访问 OpenCompass 司南官方评测页面 (https://opencompass.org.cn/leaderboard-llm) 直取当前最新 DOM 表格数据（含知识、推理、数学、代码能力评分）。`,
        models
      };
    } finally {
      await browser.close();
    }
  }
}
