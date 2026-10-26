import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class MTEBAdapter extends BaseAdapter {
  readonly sourceId = 'mteb-retrieval';
  readonly sourceUrl = 'https://huggingface.co/spaces/mteb/leaderboard';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[MTEBAdapter] Fetching latest live MTEB v2 benchmark rankings from official backend API...');

    const res = await fetch('https://mteb-leaderboard-backend.hf.space/v1/benchmarks/MTEB(eng%2C%20v2)/scores', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`MTEB API HTTP ${res.status}`);
    }

    const data = await res.json();
    const rows: any[] = data.rows || [];

    if (rows.length === 0) {
      throw new Error('MTEB returned 0 rows');
    }

    // Sort by meanTask descending
    rows.sort((a, b) => (b.meanTask || 0) - (a.meanTask || 0));

    const models: ModelRankingItem[] = rows.slice(0, 15).map((row, idx) => {
      const modelName = String(row.model?.name || 'Unknown');
      const org = modelName.includes('/') ? modelName.split('/')[0] : 'Community';
      const meanScore = Number(((row.meanTask || 0) * 100).toFixed(2));
      const paramsB = row.totalParamsB ? `${Number(row.totalParamsB).toFixed(2)}B` : 'N/A';
      const retrievalScore = row.scoresByTaskType?.Retrieval
        ? Number((row.scoresByTaskType.Retrieval * 100).toFixed(2))
        : undefined;

      const normalized = modelName
        .toLowerCase()
        .replace(/[^a-z0-9\.\-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const metricsObj: Record<string, string | number> = {
        'Mean Task Score': meanScore,
        'Total Params': paramsB
      };
      if (retrievalScore !== undefined) {
        metricsObj['Retrieval'] = retrievalScore;
      }
      if (row.scoresByTaskType?.Classification) {
        metricsObj['Classification'] = Number((row.scoresByTaskType.Classification * 100).toFixed(2));
      }
      if (row.scoresByTaskType?.STS) {
        metricsObj['STS'] = Number((row.scoresByTaskType.STS * 100).toFixed(2));
      }

      return {
        rank: idx + 1,
        model_name: modelName,
        normalized_model_name: normalized,
        organization: org,
        score: meanScore,
        metrics: metricsObj,
        notes: `发布时间: ${row.model?.releaseDate || '近期'}, 机构: ${org}, 参数量: ${paramsB}`
      };
    });

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接实时抓取自 MTEB (Massive Text Embedding Benchmark v2) 官方 Space 后端服务，涵盖 ${rows.length} 个文本向量嵌入与检索模型评测。`,
      models
    };
  }
}
