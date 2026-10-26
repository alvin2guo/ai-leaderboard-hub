import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { Source, RankingSnapshot, SourceWithRanking } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SOURCES_FILE = path.join(DATA_DIR, 'sources.yml');
const RANKINGS_DIR = path.join(DATA_DIR, 'rankings');

export function getSources(): Source[] {
  if (!fs.existsSync(SOURCES_FILE)) {
    return [];
  }
  const fileContents = fs.readFileSync(SOURCES_FILE, 'utf8');
  const data = yaml.load(fileContents) as Source[];
  return data || [];
}

export function getSourceById(id: string): Source | undefined {
  const sources = getSources();
  return sources.find((s) => s.id === id);
}

export function getRankingBySourceId(sourceId: string): RankingSnapshot | undefined {
  const rankingFile = path.join(RANKINGS_DIR, `${sourceId}.json`);
  if (!fs.existsSync(rankingFile)) {
    return undefined;
  }
  try {
    const content = fs.readFileSync(rankingFile, 'utf8');
    return JSON.parse(content) as RankingSnapshot;
  } catch (err) {
    console.error(`Error loading ranking snapshot for ${sourceId}:`, err);
    return undefined;
  }
}

export function getAllSourcesWithRankings(): SourceWithRanking[] {
  const sources = getSources();
  return sources.map((source) => {
    const snapshot = getRankingBySourceId(source.id);
    return {
      ...source,
      snapshot,
      modelCount: snapshot ? snapshot.models.length : 0,
    };
  });
}

export interface ModelCrossRankItem {
  normalized_model_name: string;
  model_name: string;
  organization: string;
  appearances: {
    source_id: string;
    source_name: string;
    rank: number;
    score: number | string;
    snapshot_date: string;
  }[];
}

export function getAllUniqueModels(): ModelCrossRankItem[] {
  const sources = getSources();
  const sourceMap = new Map(sources.map((s) => [s.id, s.name]));
  const modelMap = new Map<string, ModelCrossRankItem>();

  for (const source of sources) {
    const ranking = getRankingBySourceId(source.id);
    if (!ranking) continue;

    for (const item of ranking.models) {
      const key = item.normalized_model_name;
      if (!modelMap.has(key)) {
        modelMap.set(key, {
          normalized_model_name: key,
          model_name: item.model_name,
          organization: item.organization,
          appearances: [],
        });
      }

      const entry = modelMap.get(key)!;
      entry.appearances.push({
        source_id: source.id,
        source_name: sourceMap.get(source.id) || source.id,
        rank: item.rank,
        score: item.score,
        snapshot_date: ranking.snapshot_date,
      });
    }
  }

  return Array.from(modelMap.values()).sort(
    (a, b) => b.appearances.length - a.appearances.length
  );
}

export function resolveUrl(pathUrl: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = pathUrl.startsWith('/') ? pathUrl : `/${pathUrl}`;
  return `${cleanBase}${cleanPath}` || '/';
}
