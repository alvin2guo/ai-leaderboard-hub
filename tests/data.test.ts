import { describe, it, expect } from 'vitest';
import {
  getSources,
  getSourceById,
  getRankingBySourceId,
  getAllSourcesWithRankings,
  getAllUniqueModels,
  resolveUrl,
} from '../src/utils/data';

describe('Data Utility Functions', () => {
  it('should load all sources from data/sources.yml', () => {
    const sources = getSources();
    expect(sources.length).toBeGreaterThanOrEqual(8);
    expect(sources.some((s) => s.id === 'lmarena-chat')).toBe(true);
    expect(sources.some((s) => s.id === 'opencompass-overall')).toBe(true);
  });

  it('should retrieve individual source by ID', () => {
    const source = getSourceById('lmarena-chat');
    expect(source).toBeDefined();
    expect(source?.name).toBe('LMSYS Chatbot Arena');
    expect(source?.category).toBe('arena');
    expect(source?.url).toContain('lmsys.org');
  });

  it('should return undefined for non-existent source ID', () => {
    const source = getSourceById('non-existent-source-12345');
    expect(source).toBeUndefined();
  });

  it('should load ranking snapshot for valid sources', () => {
    const ranking = getRankingBySourceId('lmarena-chat');
    expect(ranking).toBeDefined();
    expect(ranking?.source_id).toBe('lmarena-chat');
    expect(ranking?.models.length).toBeGreaterThan(0);
    expect(ranking?.models[0].rank).toBe(1);
    expect(ranking?.models[0].normalized_model_name).toBeDefined();
  });

  it('should aggregate sources with ranking snapshots', () => {
    const list = getAllSourcesWithRankings();
    expect(list.length).toBeGreaterThanOrEqual(8);
    const arena = list.find((s) => s.id === 'lmarena-chat');
    expect(arena?.snapshot).toBeDefined();
    expect(arena?.modelCount).toBeGreaterThan(0);
  });

  it('should extract unique normalized models across all rankings', () => {
    const models = getAllUniqueModels();
    expect(models.length).toBeGreaterThan(0);
    // Models should be sorted descending by appearance count
    for (let i = 0; i < models.length - 1; i++) {
      expect(models[i].appearances.length).toBeGreaterThanOrEqual(models[i + 1].appearances.length);
    }
    // Prominent models like gpt-4o or claude-3-5-sonnet should appear multiple times
    const gpt4o = models.find((m) => m.normalized_model_name === 'gpt-4o');
    expect(gpt4o).toBeDefined();
    expect(gpt4o?.appearances.length).toBeGreaterThanOrEqual(3);
  });

  it('should correctly format resolveUrl', () => {
    const url = resolveUrl('/compare');
    expect(url.endsWith('/compare')).toBe(true);
  });
});
