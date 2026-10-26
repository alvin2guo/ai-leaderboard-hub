import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class VectaraAdapter extends BaseAdapter {
  readonly sourceId = 'vectara-hallucination';
  readonly sourceUrl = 'https://huggingface.co/spaces/vectara/leaderboard';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[VectaraAdapter] Fetching latest live hallucination benchmark from official Vectara repository...');

    const res = await fetch('https://raw.githubusercontent.com/vectara/hallucination-leaderboard/main/README.md', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Vectara GitHub HTTP ${res.status}`);
    }

    const markdown = await res.text();
    const tableHeader = '|Model|Hallucination Rate|Factual Consistency Rate|Answer Rate|';
    const startIdx = markdown.indexOf(tableHeader);
    if (startIdx === -1) {
      throw new Error('Could not find hallucination table in Vectara README');
    }

    const tablePart = markdown.slice(startIdx);
    const lines = tablePart.split('\n');
    const models: ModelRankingItem[] = [];

    // Skip header and separator (lines 0 and 1)
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('|') || !line.endsWith('|')) break;

      const cols = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cols.length < 4) continue;

      const modelName = cols[0];
      const hallRateStr = cols[1]; // e.g. "1.8 %"
      const factRateStr = cols[2]; // e.g. "98.2 %"
      const ansRateStr = cols[3];  // e.g. "99.5 %"
      const lenStr = cols[4] || 'N/A';

      const hallRate = parseFloat(hallRateStr.replace(/[^0-9.]/g, '')) || 0;
      const factRate = parseFloat(factRateStr.replace(/[^0-9.]/g, '')) || 0;
      const ansRate = parseFloat(ansRateStr.replace(/[^0-9.]/g, '')) || 0;

      const org = modelName.includes('/') ? modelName.split('/')[0] : 'Community';

      const normalized = modelName
        .toLowerCase()
        .replace(/[^a-z0-9\.\-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      models.push({
        rank: models.length + 1,
        model_name: modelName,
        normalized_model_name: normalized,
        organization: org,
        score: factRate, // Primary score: Factual Consistency Rate (higher is better)
        metrics: {
          'Hallucination Rate': `${hallRate}%`,
          'Factual Consistency Rate': `${factRate}%`,
          'Answer Rate': `${ansRate}%`,
          'Avg Summary Length': lenStr
        },
        notes: `事实一致性: ${factRate}%, 幻觉率: ${hallRate}%, 回答率: ${ansRate}%`
      });

      if (models.length >= 15) break;
    }

    if (models.length === 0) {
      throw new Error('Failed to parse models from Vectara table');
    }

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接实时抓取自 Vectara 官方 HHEM 幻觉评测基准库（涵盖最新主流大语言模型摘要一致性与幻觉率测试）。`,
      models
    };
  }
}
