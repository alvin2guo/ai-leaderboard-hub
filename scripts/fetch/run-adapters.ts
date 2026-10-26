import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { OpenCompassAdapter } from './opencompass-adapter';
import { ArtificialAnalysisAdapter } from './artificial-analysis-adapter';
import { SuperCLUEAdapter } from './superclue-adapter';
import { HuggingFaceLeaderboardAdapter } from './huggingface-adapter';
import { OpenRouterAdapter } from './openrouter-adapter';
import { VectaraAdapter } from './vectara-adapter';
import { MTEBAdapter } from './mteb-adapter';
import type { Source } from '../../src/utils/types';

async function main() {
  console.log('🚀 Executing live web scrapers across all active AI evaluation leaderboards...\n');

  const adapters = [
    new OpenCompassAdapter(),
    new OpenRouterAdapter(),
    new ArtificialAnalysisAdapter(),
    new SuperCLUEAdapter(),
    new HuggingFaceLeaderboardAdapter(),
    new VectaraAdapter(),
    new MTEBAdapter(),
  ];

  let successCount = 0;
  let failCount = 0;
  const today = new Date().toISOString().split('T')[0];

  for (const adapter of adapters) {
    try {
      const res = await adapter.update();
      if (res.success) {
        successCount++;
        console.log(`✅ [${adapter.sourceId}] ${res.message}`);
      } else {
        failCount++;
        console.warn(`⚠️ [${adapter.sourceId}] Warning: ${res.message}`);
      }
    } catch (err: any) {
      failCount++;
      console.error(`❌ [${adapter.sourceId}] Error:`, err.message);
    }
  }

  // Update data/sources.yml with today's checked date and mark auto_fetch_supported for scraped sources
  try {
    const sourcesPath = path.resolve(process.cwd(), 'data', 'sources.yml');
    if (fs.existsSync(sourcesPath)) {
      const rawYaml = fs.readFileSync(sourcesPath, 'utf8');
      const sources = yaml.load(rawYaml) as Source[];
      const scrapedIds = new Set(adapters.map(a => a.sourceId));

      sources.forEach(s => {
        if (scrapedIds.has(s.id)) {
          s.last_checked_at = today;
          s.auto_fetch_supported = true;
        }
      });

      fs.writeFileSync(sourcesPath, yaml.dump(sources), 'utf8');
      console.log(`\n✓ Synchronized data/sources.yml with latest scrape timestamps and auto-fetch flags.`);
    }
  } catch (err: any) {
    console.error('Failed to update data/sources.yml:', err.message);
  }

  console.log(`\n🏁 Scraping pipeline complete: ${successCount} successful, ${failCount} warnings.`);
  process.exit(0);
}

main();
