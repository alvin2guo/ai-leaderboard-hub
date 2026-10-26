import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class SuperCLUEAdapter extends BaseAdapter {
  readonly sourceId = 'superclue-general';
  readonly sourceUrl = 'https://www.superclueai.com/';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[SuperCLUEAdapter] Fetching latest live SuperCLUE leaderboard from official repository...');

    const res = await fetch('https://raw.githubusercontent.com/CLUEbenchmark/SuperCLUE/main/README.md', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/plain'
      }
    });

    if (!res.ok) {
      throw new Error(`SuperCLUE fetch failed: HTTP ${res.status}`);
    }

    const md = await res.text();
    const lines = md.split('\n');

    // Parse Markdown table lines
    const tableRows = lines
      .map(l => l.trim())
      .filter(l => l.startsWith('|') && l.endsWith('|'))
      .filter(l => !l.includes(':-:') && !l.includes('排名') && !l.includes('---'));

    if (tableRows.length === 0) {
      throw new Error('No table rows found in SuperCLUE markdown');
    }

    const models: ModelRankingItem[] = [];
    let rankCounter = 1;

    for (const row of tableRows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      // Expected columns: [排名, 模型, 机构, 总分, OPEN多轮开放问题, OPT三大能力客观题, 使用]
      if (cols.length >= 4) {
        const rawModel = cols[1];
        const org = cols[2];
        const score = parseFloat(cols[3]);

        if (!isNaN(score) && rawModel) {
          const normalized = rawModel
            .toLowerCase()
            .replace(/（[^）]*）|\([^)]*\)/g, '')
            .replace(/[^a-z0-9\.\-]+/g, '-')
            .replace(/^-+|-+$/g, '') || rawModel.toLowerCase();

          const openScore = cols[4] ? parseFloat(cols[4]) : undefined;
          const optScore = cols[5] ? parseFloat(cols[5]) : undefined;

          models.push({
            rank: rankCounter++,
            model_name: rawModel,
            normalized_model_name: normalized,
            organization: org,
            score: score,
            metrics: {
              '总分': score,
              ...(openScore ? { 'OPEN多轮开放问题': openScore } : {}),
              ...(optScore ? { 'OPT三大能力客观题': optScore } : {})
            },
            notes: `部署渠道: ${cols[6] || 'API/网页'}`
          });
        }
      }
      if (models.length >= 15) break;
    }

    if (models.length === 0) {
      throw new Error('Failed to parse valid model rows from SuperCLUE');
    }

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接抓取自 SuperCLUE 官方基准最新公布的测评天梯榜单。`,
      models
    };
  }
}
