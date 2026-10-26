export type SourceCategory = 'arena' | 'comprehensive' | 'chinese' | 'specialized' | 'directory';
export type ModalityType = 'text' | 'multimodal' | 'code' | 'embedding' | 'audio' | 'all';
export type RankingType = 'elo' | 'benchmark' | 'human_eval' | 'win_rate' | 'cost_quality' | 'curated_list';
export type UpdateFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'manual';

export interface Source {
  id: string;
  name: string;
  category: SourceCategory;
  modality: ModalityType;
  url: string;
  description: string;
  ranking_type: RankingType;
  metrics: string[];
  license_or_terms_url: string;
  last_checked_at: string;
  update_frequency: UpdateFrequency;
  auto_fetch_supported: boolean;
  notes?: string;
}

export interface ModelRankingItem {
  rank: number;
  model_name: string;
  normalized_model_name: string;
  organization: string;
  score: number | string;
  metrics?: Record<string, string | number>;
  notes?: string;
}

export interface RankingSnapshot {
  source_id: string;
  snapshot_date: string;
  source_url: string;
  raw_notes?: string;
  models: ModelRankingItem[];
}

export interface SourceWithRanking extends Source {
  snapshot?: RankingSnapshot;
  modelCount?: number;
}
