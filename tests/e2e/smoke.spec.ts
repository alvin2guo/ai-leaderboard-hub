import { test, expect } from '@playwright/test';

test.describe('AI Leaderboard Hub Smoke Tests', () => {
  test('Home page renders successfully with leaderboards and stats', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/AI Leaderboard Hub/);

    // Check heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('聚合主流 AI 评测榜单');

    // Check stats are rendered
    await expect(page.locator('text=收录权威榜单')).toBeVisible();

    // Check sources grid cards are rendered
    const cards = page.locator('#sources-grid > div');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test('Leaderboard detail page renders model snapshot table', async ({ page }) => {
    await page.goto('/sources/artificial-analysis');

    // Check title and source name
    await expect(page.locator('h1')).toContainText('Artificial Analysis Leaderboard');

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
