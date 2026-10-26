import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class OpenCompassAdapter extends BaseAdapter {
  readonly sourceId = 'opencompass-overall';
  readonly sourceUrl = 'https://rank.opencompass.org.cn/leaderboard-llm';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[OpenCompassAdapter] Fetching latest live OpenCompass evaluation dataset...');

    const res = await fetch('https://cdn.opencompass.org.cn/assets/lm/data-lm-ability_official.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`OpenCompass fetch failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    const modelBase: Record<string, any> = data.modelBase || {};
    const overallList: any[] = data.OverallTable || [];

    if (overallList.length === 0) {
      throw new Error('OpenCompass returned empty OverallTable');
    }

    // Sort by Average score descending
    const sorted = [...overallList].sort((a, b) => {
      const avgA = Number(a.Average) || 0;
      const avgB = Number(b.Average) || 0;
      return avgB - avgA;
    });

    const models: ModelRankingItem[] = sorted.slice(0, 15).map((row, idx) => {
      const modelKey = String(row.key);
      const baseInfo = modelBase[modelKey] || {};
      const modelName = baseInfo.model || modelKey;
      const org = baseInfo.org || 'Unknown';

      const normalized = modelKey
        .toLowerCase()
        .replace(/[^a-z0-9\.\-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return {
        rank: idx + 1,
        model_name: modelName,
        normalized_model_name: normalized,
        organization: org,
        score: Number(row.Average) || 0,
        metrics: {
          'Overall Score': Number(row.Average) || 0,
          Knowledge: Number(row.Knowledge) || 0,
          Abstraction: Number(row.Abstraction) || 0,
          Reasoning: Number(row.Reasoning) || 0,
          Interaction: Number(row.Interaction) || 0,
          Safety: Number(row.Safety) || 0,
          Agent: Number(row.Agent) || 0
        },
        notes: `发布时间: ${row.release_date || baseInfo.date || '近期'}, 机构: ${org}`
      };
    });

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接实时抓取自 OpenCompass 司南官方评测数据源（包含知识、抽象、推理、交互、安全五维一体能力全面评测）。`,
      models
    };
  }
}
