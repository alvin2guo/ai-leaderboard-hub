import { test, expect } from '@playwright/test';

test.describe('AI Leaderboard Hub Smoke & Timeline Tests', () => {
  test('Home page renders timeline hero and interactive scrubber', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/AI Leaderboard Hub/);

    // Check date display header (reference image match)
    const dateHeading = page.locator('#timeline-date-display');
    await expect(dateHeading).toBeVisible();
    await expect(dateHeading).toContainText('2026.11.13');

    // Check benchmark title
    await expect(page.locator('#benchmark-title')).toContainText('AA 智能指数');

    // Check top model is Claude Fable 5.2 with score 64.6 on 2026.11.13
    const topModelRow = page.locator('.leaderboard-row').first();
    await expect(topModelRow).toBeVisible();
    await expect(topModelRow.locator('.model-bar-pill')).toContainText('Claude Fable 5.2');
    await expect(topModelRow.locator('.score-display')).toContainText('64.6');

    // Check month ticks are present
    const monthTicks = page.locator('.month-tick-btn');
    const tickCount = await monthTicks.count();
    expect(tickCount).toBe(12);

    // Test clicking a tick to time-travel (e.g. 12月)
    const decTick = page.locator('button[data-target-index="0"]');
    await decTick.dispatchEvent('click');
    await page.waitForTimeout(300);
    await expect(dateHeading).toContainText('2025.12.15');
    await expect(page.locator('.leaderboard-row').first()).toContainText('GPT-4o');

    // Test clicking back to 11月
    const novTick = page.locator('button[data-target-index="12"]');
    await novTick.dispatchEvent('click');
    await page.waitForTimeout(300);
    await expect(dateHeading).toContainText('2026.11.13');
    await expect(page.locator('.leaderboard-row').first()).toContainText('Claude Fable 5.2');

    // Check sources grid cards are rendered
    const cards = page.locator('#sources-grid > div');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test('Leaderboard detail page renders model snapshot table', async ({ page }) => {
    await page.goto('/sources/artificial-analysis');

    // Check title and source name
    await expect(page.locator('h1')).toContainText('Artificial Analysis');

    // Check disclaimer note
    await expect(page.locator('text=快照采纳链接')).toBeVisible();

    // Check table has models
    const rows = page.locator('#ranking-models-table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(5);

    // Check prominent model exists
    await expect(page.locator('#ranking-models-table')).toContainText('Claude');
  });

  test('Cross-model comparison page renders multi-model matrix', async ({ page }) => {
    await page.goto('/compare');

    await expect(page.locator('h1')).toContainText('模型跨榜表现客观对照');
    await expect(page.locator('text=跨榜单不可直接比较分值')).toBeVisible();

    // Table should contain selected models in headers
    const headers = page.locator('#table-header-row th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(4);
  });

  test('About page renders compliance principles and license', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('h1')).toContainText('关于 AI Leaderboard Hub');
    await expect(page.locator('text=绝不伪造或编造数据')).toBeVisible();
    await expect(page.locator('text=坚决不做跨榜加权混排')).toBeVisible();
    await expect(page.locator('text=MIT License').first()).toBeVisible();
  });
});
