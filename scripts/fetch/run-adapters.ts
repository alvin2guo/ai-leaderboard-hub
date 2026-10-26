import { OpenRouterAdapter } from './openrouter-adapter';

async function main() {
  console.log('🚀 Running scheduled leaderboard data adapters...');
  const adapters = [
    new OpenRouterAdapter(),
  ];

  let successCount = 0;
  let failCount = 0;

  for (const adapter of adapters) {
    try {
      const res = await adapter.update();
      if (res.success) {
        successCount++;
      } else {
        failCount++;
        console.warn(`⚠️ Adapter warning for ${adapter.sourceId}: ${res.message}`);
      }
    } catch (err: any) {
      failCount++;
      console.error(`❌ Adapter error for ${adapter.sourceId}:`, err);
    }
  }

  console.log(`\n🏁 Adapters execution complete: ${successCount} updated, ${failCount} warnings/failed.`);
  // Note: we do NOT exit with non-zero code to avoid blocking deployment; warnings are captured in logs
  process.exit(0);
}

main();
