import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class HuggingFaceLeaderboardAdapter extends BaseAdapter {
  readonly sourceId = 'huggingface-allbench';
  readonly sourceUrl = 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[HuggingFaceLeaderboardAdapter] Fetching latest Open LLM Leaderboard v2 dataset...');

    const res = await fetch('https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard%2Fcontents&config=default&split=train&offset=0&limit=100', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HF Open LLM API HTTP ${res.status}`);
    }

    const data = await res.json();
    const rows: any[] = data.rows || [];

    if (rows.length === 0) {
      throw new Error('HF Open LLM returned 0 rows');
    }

    // Sort by Average score descending
    const sorted = rows.map((r: any) => r.row).sort((a: any, b: any) => {
      const scoreA = Number(a['Average ⬆️']) || 0;
      const scoreB = Number(b['Average ⬆️']) || 0;
      return scoreB - scoreA;
    });

    const models: ModelRankingItem[] = sorted.slice(0, 15).map((item: any, idx: number) => {
      const rawName = String(item.fullname || item.Model || 'Unknown').replace(/<[^>]+>/g, '').trim();
      const org = rawName.includes('/') ? rawName.split('/')[0] : 'Community';

      const normalized = rawName
        .toLowerCase()
        .replace(/[^a-z0-9\.\-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const avgScore = Number(Number(item['Average ⬆️'] || 0).toFixed(2));

      return {
        rank: idx + 1,
        model_name: rawName,
        normalized_model_name: normalized,
        organization: org,
        score: avgScore,
        metrics: {
          'Average Score': avgScore,
          IFEval: Number(Number(item.IFEval || 0).toFixed(2)),
          BBH: Number(Number(item.BBH || 0).toFixed(2)),
          'MATH L5': Number(Number(item['MATH Lvl 5'] || 0).toFixed(2)),
          GPQA: Number(Number(item.GPQA || 0).toFixed(2)),
          MuSR: Number(Number(item.MUSR || 0).toFixed(2)),
          'MMLU-PRO': Number(Number(item['MMLU-PRO'] || 0).toFixed(2))
        },
        notes: `参数量: ${item['#Params (B)'] || 'N/A'}B, 架构: ${item.Architecture || 'Transformer'}, 提交日期: ${item['Submission Date'] || 'N/A'}`
      };
    });

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接实时抓取自 Hugging Face Open LLM Leaderboard v2 官方数据集基准。`,
      models
    };
  }
}
