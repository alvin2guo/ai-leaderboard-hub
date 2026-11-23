import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class ArtificialAnalysisAdapter extends BaseAdapter {
  readonly sourceId = 'artificial-analysis';
  readonly sourceUrl = 'https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log(`[ArtificialAnalysisAdapter] Fetching official evaluation data from ${this.sourceUrl}...`);

    const res = await fetch(this.sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Artificial Analysis HTTP ${res.status}`);
    }

    const html = await res.text();

    // Extract self.__next_f streaming chunks
    const pushRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
    let match;
    let combined = '';

    while ((match = pushRegex.exec(html)) !== null) {
      try {
        combined += JSON.parse(`"${match[1]}"`);
      } catch {
        combined += match[1];
      }
    }

    const marker = '"initialModels":';
    const startIdx = combined.indexOf(marker);
    if (startIdx === -1) {
      throw new Error('Failed to find initialModels in evaluation page stream');
    }

    let arrayStart = combined.indexOf('[', startIdx);
    let openBrackets = 0;
    let arrayEnd = -1;

    for (let i = arrayStart; i < combined.length; i++) {
      if (combined[i] === '[') openBrackets++;
      else if (combined[i] === ']') {
        openBrackets--;
        if (openBrackets === 0) {
          arrayEnd = i + 1;
          break;
        }
      }
    }

    if (arrayEnd === -1) {
      throw new Error('Failed to parse initialModels array boundaries');
    }

    const modelsData = JSON.parse(combined.slice(arrayStart, arrayEnd));
    console.log(`[ArtificialAnalysisAdapter] Successfully extracted ${modelsData.length} models from official Intelligence Index v5.0.1`);

    // Sort descending by exact intelligenceIndex
    const sorted = modelsData
      .filter((m: any) => typeof m.intelligenceIndex === 'number' && !isNaN(m.intelligenceIndex))
      .sort((a: any, b: any) => b.intelligenceIndex - a.intelligenceIndex);

    const models: ModelRankingItem[] = sorted.map((item: any, idx: number) => {
      const rank = idx + 1;
      const scoreExact = parseFloat(item.intelligenceIndex.toFixed(2));
      const roundedScore = Math.round(item.intelligenceIndex);
      const name = item.name || item.shortName;
      const shortName = item.shortName || item.name;
      const org = item.creator?.name || 'Unknown';

      const normalized = shortName
        .toLowerCase()
        .replace(/[^a-z0-9\.\-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const metricsObj: Record<string, string | number> = {
        'Intelligence Index': roundedScore,
        'Exact Index': scoreExact,
      };

      if (item.effort?.label) {
        metricsObj['Reasoning Effort'] = item.effort.label;
      }
      if (typeof item.outputSpeed === 'number') {
        metricsObj['Speed (t/s)'] = parseFloat(item.outputSpeed.toFixed(1));
      }
      if (typeof item.price1mInputTokens === 'number' && typeof item.price1mOutputTokens === 'number') {
        metricsObj['Price ($ In/Out 1M)'] = `$${item.price1mInputTokens}/$${item.price1mOutputTokens}`;
      }
      if (typeof item.hleDiamond === 'number') {
        metricsObj['HLE-Diamond'] = parseFloat((item.hleDiamond * 100).toFixed(1));
      }
      if (typeof item.terminalBench40 === 'number') {
        metricsObj['Terminal-Bench 4.0'] = parseFloat((item.terminalBench40 * 100).toFixed(1));
      }
      if (typeof item.frontierCode20 === 'number') {
        metricsObj['FrontierCode 2.0'] = parseFloat((item.frontierCode20 * 100).toFixed(1));
      }

      return {
        rank,
        model_name: shortName,
        normalized_model_name: normalized,
        organization: org,
        score: roundedScore,
        metrics: metricsObj,
        notes: `机构: ${org} | 评级: ${item.suffix || item.effort?.label || 'standard'} | 准确分: ${scoreExact}`,
      };
    });

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接实时提取自 Artificial Analysis 官方 Intelligence Index v5.0.1 评测基准页 (${this.sourceUrl})，涵盖知识、代码、科学与通用知识 9 大项评测套件，收录 ${models.length} 款模型。`,
      models,
    };
  }
}
