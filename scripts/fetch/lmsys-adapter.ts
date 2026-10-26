import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class LMSYSAdapter extends BaseAdapter {
  readonly sourceId = 'lmarena-chat';
  readonly sourceUrl = 'https://chat.lmsys.org/?leaderboard';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[LMSYSAdapter] Fetching latest live Chatbot Arena Elo ratings...');

    const res = await fetch('https://datasets-server.huggingface.co/rows?dataset=mathewhe%2Fchatbot-arena-elo&config=default&split=train&offset=0&limit=30', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch LMSYS dataset: HTTP ${res.status}`);
    }

    const data = await res.json();
    const rows: any[] = data.rows || [];

    if (rows.length === 0) {
      throw new Error('LMSYS dataset returned 0 rows');
    }

    // Sort by Arena Score descending
    const sorted = rows.map((r: any) => r.row).sort((a: any, b: any) => {
      const scoreA = Number(a['Arena Score']) || 0;
      const scoreB = Number(b['Arena Score']) || 0;
      return scoreB - scoreA;
    });

    const models: ModelRankingItem[] = sorted.slice(0, 15).map((item: any, idx: number) => {
      const rawName = String(item.Model || item.model || 'Unknown');
      const normalized = rawName
        .toLowerCase()
        .replace(/[^a-z0-9\.\-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-latest.*$/, '')
        .replace(/-preview.*$/, '');

      return {
        rank: idx + 1,
        model_name: rawName,
        normalized_model_name: normalized,
        organization: String(item.Organization || 'Unknown'),
        score: Number(item['Arena Score']) || 0,
        metrics: {
          'Arena Elo': Number(item['Arena Score']) || 0,
          '95% CI': String(item['95% CI'] || ''),
          'Votes Count': Number(item.Votes) || 0
        },
        notes: `盲测胜率置信区间: ${item['95% CI'] || 'N/A'}, 执裁样本: ${item.Votes || 'N/A'}`
      };
    });

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接实时抓取自 LMSYS Chatbot Arena 官方数据集快照（共 ${rows.length} 款评测模型，按 Arena Elo 综合天梯排序）。`,
      models
    };
  }
}
