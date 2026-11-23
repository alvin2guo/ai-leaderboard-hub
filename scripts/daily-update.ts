import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function runStep(name: string, command: string) {
  console.log(`\n======================================================`);
  console.log(`▶ [STEP] ${name}`);
  console.log(`  $ ${command}`);
  console.log(`======================================================`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✔ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`✖ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 [Daily Leaderboard Automation] Starting full automated pipeline...\n');
  const cwd = process.cwd();

  try {
    // 1. Scrape live benchmark data and sync timeline
    runStep('1. Live Benchmarks Scraping & Timeline Sync', 'npx tsx scripts/fetch/run-adapters.ts');

    // 2. Explicit timeline data generation check
    runStep('2. Verify Timeline Data Compilation', 'npx tsx scripts/generate-timeline-data.ts');

    // 3. Schema & integrity validation
    runStep('3. Schema Validation', 'npm run validate:data');

    // 4. Unit tests
    runStep('4. Vitest Unit Tests', 'npm run test');

    // 5. Static production build
    runStep('5. Production Build', 'npm run build');

    // 6. End-to-end browser tests
    runStep('6. Playwright E2E Tests', 'npx playwright test --workers=1');

    // 7. Git status check & deploy commit
    console.log(`\n======================================================`);
    console.log(`▶ [STEP] 7. Git Status & Deployment Push`);
    console.log(`======================================================`);
    const statusOutput = execSync('git status --porcelain', { cwd, encoding: 'utf8' }).trim();

    if (statusOutput.length > 0) {
      console.log('Detected modified files:\n' + statusOutput);
      execSync('git add data/ src/data/timeline-data.json', { cwd, stdio: 'inherit' });
      const stagedOutput = execSync('git diff --cached --name-only', { cwd, encoding: 'utf8' }).trim();
      if (stagedOutput.length > 0) {
        const commitMsg = `chore(data): auto-update leaderboard snapshots (${new Date().toISOString().split('T')[0]}) [skip ci]`;
        execSync(`git commit -m "${commitMsg}"`, { cwd, stdio: 'inherit' });
        console.log(`✔ Created commit: ${commitMsg}`);
        execSync('git push origin main', { cwd, stdio: 'inherit' });
        console.log('✔ Pushed to GitHub main branch. GitHub Actions deployment triggered.');
      } else {
        console.log('No data files staged for commit.');
      }
    } else {
      console.log('No repository changes detected. All leaderboard data is already up to date.');
    }

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 [Daily Leaderboard Automation] Completed successfully in ${elapsedSec}s!`);
  } catch (error: any) {
    console.error('\n💥 [Daily Leaderboard Automation] Execution aborted due to error.');
    process.exit(1);
  }
}

main();
