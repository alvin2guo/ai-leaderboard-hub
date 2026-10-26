import { BaseAdapter } from './base-adapter';
import type { RankingSnapshot, ModelRankingItem } from '../../src/utils/types';

export class ArtificialAnalysisAdapter extends BaseAdapter {
  readonly sourceId = 'artificial-analysis';
  readonly sourceUrl = 'https://artificialanalysis.ai/leaderboards/models';

  async fetchSnapshot(): Promise<RankingSnapshot> {
    const today = new Date().toISOString().split('T')[0];
    console.log('[ArtificialAnalysisAdapter] Fetching latest live page data from artificialanalysis.ai/leaderboards/models...');

    const res = await fetch('https://artificialanalysis.ai/leaderboards/models', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Artificial Analysis HTTP ${res.status}`);
    }

    const html = await res.text();
    // Unescape Next.js streaming quotes
    const unescaped = html.replace(/\\"/g, '"');
    const blocks = unescaped.split('{"slug":');

    interface ExtractedModel {
      slug: string;
      name: string;
      shortName: string;
      creator: string;
      contextTokens: number;
      intelligenceIndex: number;
      costPerTask?: number;
      speedTps?: number;
      priceInput1M?: number;
      priceOutput1M?: number;
    }

    const parsedList: ExtractedModel[] = [];

    for (const block of blocks) {
      if (!block.includes('"intelligenceIndex":')) continue;

      const shortNameMatch = block.match(/"shortName":"([^"]+)"/);
      const nameMatch = block.match(/"name":"([^"]+)"/);
      const creatorMatch = block.match(/"modelCreatorName":"([^"]+)"/);
      const contextMatch = block.match(/"contextWindowTokens":([0-9]+)/);
      const intelMatch = block.match(/"intelligenceIndex":([0-9.]+)/);
      const costMatch = block.match(/"intelligenceIndexCostPerTask":([0-9.]+)/);
      const speedMatch = block.match(/"medianOutputTokensPerSecond":([0-9.]+)/);
      const inputPriceMatch = block.match(/"price1mInputTokens":([0-9.]+)/);
      const outputPriceMatch = block.match(/"price1mOutputTokens":([0-9.]+)/);

      if (intelMatch && (shortNameMatch || nameMatch)) {
        const shortName = shortNameMatch ? shortNameMatch[1] : nameMatch![1];
        const name = nameMatch ? nameMatch[1] : shortName;
        const slugMatch = block.match(/^"([^"]+)"/);
        const slug = slugMatch ? slugMatch[1] : shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        parsedList.push({
          slug,
          name,
          shortName,
          creator: creatorMatch ? creatorMatch[1] : 'Unknown',
          contextTokens: contextMatch ? parseInt(contextMatch[1], 10) : 0,
          intelligenceIndex: parseFloat(intelMatch[1]),
          costPerTask: costMatch ? parseFloat(costMatch[1]) : undefined,
          speedTps: speedMatch ? parseFloat(speedMatch[1]) : undefined,
          priceInput1M: inputPriceMatch ? parseFloat(inputPriceMatch[1]) : undefined,
          priceOutput1M: outputPriceMatch ? parseFloat(outputPriceMatch[1]) : undefined,
        });
      }
    }

    if (parsedList.length === 0) {
      throw new Error('Failed to parse models with intelligenceIndex from Artificial Analysis page');
    }

    // Sort descending by exact intelligenceIndex
    parsedList.sort((a, b) => b.intelligenceIndex - a.intelligenceIndex);

    // Format top 15 models matching the official leaderboard table display
    const models: ModelRankingItem[] = parsedList.slice(0, 15).map((item, idx) => {
      const rank = idx + 1;
      const roundedScore = Math.round(item.intelligenceIndex);
      const contextStr = item.contextTokens >= 1000000
        ? `${Math.round(item.contextTokens / 1000000)}M`
        : `${Math.round(item.contextTokens / 1000)}k`;

      const normalized = item.shortName
        .toLowerCase()
        .replace(/[^a-z0-9\.\-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const metricsObj: Record<string, string | number> = {
        'Intelligence Index': roundedScore,
        'Exact Index': parseFloat(item.intelligenceIndex.toFixed(2)),
        'Context Window': contextStr,
      };

      if (item.costPerTask !== undefined) {
        metricsObj['Cost / Task (USD)'] = `$${item.costPerTask.toFixed(2)}`;
      }
      if (item.speedTps !== undefined) {
        metricsObj['Median Speed'] = `${Math.round(item.speedTps)} tps`;
      }
      if (item.priceInput1M !== undefined && item.priceOutput1M !== undefined) {
        metricsObj['Price ($ In/Out 1M)'] = `$${item.priceInput1M}/$${item.priceOutput1M}`;
      }

      const noteParts = [
        `机构: ${item.creator}`,
        `上下文: ${contextStr}`,
      ];
      if (item.costPerTask !== undefined) noteParts.push(`成本: $${item.costPerTask.toFixed(2)}`);
      if (item.speedTps !== undefined) noteParts.push(`速度: ${Math.round(item.speedTps)} tps`);

      return {
        rank,
        model_name: item.shortName,
        normalized_model_name: normalized,
        organization: item.creator,
        score: roundedScore,
        metrics: metricsObj,
        notes: noteParts.join(' | ')
      };
    });

    return {
      source_id: this.sourceId,
      snapshot_date: today,
      source_url: this.sourceUrl,
      raw_notes: `直接实时抓取自 Artificial Analysis 官方榜单页面 (https://artificialanalysis.ai/leaderboards/models) 状态流，收录 ${parsedList.length} 个模型与测试版本。评分以官方 Artificial Analysis Intelligence Index 为基准。`,
      models
    };
  }
}
