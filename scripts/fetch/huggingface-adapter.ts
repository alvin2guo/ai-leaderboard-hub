import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class HuggingFaceLeaderboardAdapter extends BaseAdapter {
  readonly sourceId = 'huggingface-allbench';
  readonly sourceUrl = 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[HuggingFaceLeaderboardAdapter] Fetching latest Open LLM Leaderboard v2 live dataset from official backend...');

    const res = await fetch('https://open-llm-leaderboard-open-llm-leaderboard.hf.space/api/leaderboard/formatted', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HF Open LLM API HTTP ${res.status}`);
    }

    const list: any[] = await res.json();
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('HF Open LLM returned empty list');
    }

    // Filter valid models and sort descending by average_score
    const sorted = list
      .filter((m: any) => m.model && typeof m.model.average_score === 'number')
      .sort((a: any, b: any) => b.model.average_score - a.model.average_score);

    const models: ModelRankingItem[] = sorted.slice(0, 15).map((item: any, idx: number) => {
      const rawName = String(item.model?.name || 'Unknown');
      const org = rawName.includes('/') ? rawName.split('/')[0] : 'Community';

      const normalized = rawName
        .toLowerCase()
        .replace(/[^a-z0-9\.\-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const avgScore = Number(Number(item.model.average_score).toFixed(2));
      const evals = item.evaluations || {};

      return {
        rank: idx + 1,
        model_name: rawName,
        normalized_model_name: normalized,
        organization: org,
        score: avgScore,
        metrics: {
          'Average Score': avgScore,
          IFEval: Number(Number(evals.ifeval?.normalized_score || 0).toFixed(2)),
          BBH: Number(Number(evals.bbh?.normalized_score || 0).toFixed(2)),
          'MATH L5': Number(Number(evals.math?.normalized_score || 0).toFixed(2)),
          GPQA: Number(Number(evals.gpqa?.normalized_score || 0).toFixed(2)),
          MuSR: Number(Number(evals.musr?.normalized_score || 0).toFixed(2)),
          'MMLU-PRO': Number(Number(evals.mmlu_pro?.normalized_score || 0).toFixed(2))
        },
        notes: `架构: ${item.model?.architecture || 'Unknown'}, 权重类型: ${item.model?.weight_type || 'Original'}, 精度: ${item.model?.precision || 'bfloat16'}`
      };
    });

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接实时抓取自 Hugging Face Open LLM Leaderboard v2 官方 Space 服务端（覆盖 ${list.length} 个最新开源大模型测评数据）。`,
      models
    };
  }
}
