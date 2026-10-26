import { chromium } from '@playwright/test';
import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class OpenRouterAdapter extends BaseAdapter {
  readonly sourceId = 'openrouter-rankings';
  readonly sourceUrl = 'https://openrouter.ai/rankings';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[OpenRouterAdapter] Launching headless browser to scrape live table from openrouter.ai/rankings...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1400, height: 900 }
    });

    const page = await context.newPage();
    try {
      await page.goto(this.sourceUrl, { timeout: 45000, waitUntil: 'domcontentloaded' });
      await page.waitForSelector('table tbody tr', { state: 'attached', timeout: 25000 });
      await page.waitForTimeout(3000);

      const rowsData = await page.locator('table tbody tr').evaluateAll(rows => {
        return rows.map(tr => {
          const rankText = tr.querySelector('td:nth-child(1)')?.textContent?.trim() || '';
          const modelName = tr.querySelector('th')?.textContent?.trim() || '';
          const author = tr.querySelector('td:nth-child(3)')?.textContent?.trim() || '';
          const tokensProcessed = tr.querySelector('td:nth-child(4)')?.textContent?.trim() || '';
          const change = tr.querySelector('td:nth-child(5)')?.textContent?.trim() || '';
          return { rankText, modelName, author, tokensProcessed, change };
        });
      });

      console.log(`[OpenRouterAdapter] Extracted ${rowsData.length} raw table rows from DOM.`);

      const models: ModelRankingItem[] = [];

      for (const row of rowsData) {
        const rank = parseInt(row.rankText, 10);
        if (isNaN(rank) || !row.modelName) continue;

        // Parse token volume into float (e.g. "33.6T tokens" -> 33.6)
        const numTokensMatch = row.tokensProcessed.match(/([0-9.]+)\s*([TMBk]?)/i);
        let numericScore = rank;
        if (numTokensMatch) {
          const val = parseFloat(numTokensMatch[1]);
          const unit = numTokensMatch[2].toUpperCase();
          if (unit === 'T') numericScore = parseFloat((val * 1000).toFixed(1));
          else if (unit === 'B') numericScore = parseFloat(val.toFixed(1));
          else if (unit === 'M') numericScore = parseFloat((val / 1000).toFixed(2));
          else numericScore = val;
        }

        const normalized = row.modelName
          .toLowerCase()
          .replace(/[^a-z0-9\.\-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        models.push({
          rank,
          model_name: row.modelName,
          normalized_model_name: normalized,
          organization: row.author,
          score: numericScore,
          metrics: {
            'Rank': rank,
            'Tokens Processed': row.tokensProcessed,
            'Change': row.change,
            'Author': row.author
          },
          notes: `全球开发者调用量排名 #${rank} | 处理总量: ${row.tokensProcessed} | 环比变化: ${row.change}`
        });

        if (models.length >= 15) break;
      }

      if (models.length === 0) {
        throw new Error('Failed to parse any valid models from OpenRouter DOM table');
      }

      return {
        source_id: this.sourceId,
        snapshot_date: today,
        source_url: this.sourceUrl,
        raw_notes: `通过 Playwright 无头浏览器模拟访问 OpenRouter 官方排行榜 (https://openrouter.ai/rankings) 抓取真实 Token 消耗与开发者调用热度排名。`,
        models
      };
    } finally {
      await browser.close();
    }
  }
}
