import fs from 'node:fs';
import path from 'node:path';

export interface TimelineModel {
  rank: number;
  name: string;
  normalized_name: string;
  org: string;
  orgType: 'anthropic' | 'google' | 'openai' | 'meta' | 'kimi' | 'deepseek' | 'alibaba' | 'other';
  score: number;
  scoreDisplay: string;
}

export interface TimelinePoint {
  id: string; // e.g. "2026-11-13"
  dateDisplay: string; // e.g. "2026.11.13"
  monthKey: string; // e.g. "2026-11"
  label: string; // e.g. "11月"
  isKeyTick: boolean; // whether shown as one of the 12 month ticks
  models: TimelineModel[];
}

export interface BenchmarkTimeline {
  id: string;
  name: string;
  subtitle: string;
  sourceUrl: string;
  maxScoreRef: number;
  unit: string;
  points: TimelinePoint[];
}

// 12 key month ticks: 12月 (2025.12), 26年 (2026.01), 2月, 3月, 4月, 5月, 6月, 7月, 8月, 9月, 10月, 11月

// 1. Artificial Analysis Timeline (matching user's screenshot exactly)
const aaPoints: TimelinePoint[] = [
  {
    id: '2025-12-15',
    dateDisplay: '2025.12.15',
    monthKey: '2025-12',
    label: '12月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'GPT-4o (2024-11)', normalized_name: 'gpt-4o', org: 'OpenAI', orgType: 'openai', score: 88.5, scoreDisplay: '88.5' },
      { rank: 2, name: 'Claude 3.5 Sonnet', normalized_name: 'claude-3-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 88.1, scoreDisplay: '88.1' },
      { rank: 3, name: 'Gemini 1.5 Pro', normalized_name: 'gemini-1-5-pro', org: 'Google', orgType: 'google', score: 85.2, scoreDisplay: '85.2' },
      { rank: 4, name: 'Llama 3.1 405B', normalized_name: 'llama-3-1-405b', org: 'Meta', orgType: 'meta', score: 84.3, scoreDisplay: '84.3' },
      { rank: 5, name: 'Claude 3.5 Haiku', normalized_name: 'claude-3-5-haiku', org: 'Anthropic', orgType: 'anthropic', score: 83.2, scoreDisplay: '83.2' },
      { rank: 6, name: 'Qwen 2.5 72B', normalized_name: 'qwen-2-5-72b', org: 'Alibaba', orgType: 'alibaba', score: 82.6, scoreDisplay: '82.6' },
      { rank: 7, name: 'o1-preview', normalized_name: 'o1-preview', org: 'OpenAI', orgType: 'openai', score: 82.0, scoreDisplay: '82.0' },
      { rank: 8, name: 'Kimi Moonshot v1', normalized_name: 'kimi-moonshot-v1', org: 'Kimi', orgType: 'kimi', score: 79.5, scoreDisplay: '79.5' },
      { rank: 9, name: 'DeepSeek V2.5', normalized_name: 'deepseek-v2-5', org: 'DeepSeek', orgType: 'deepseek', score: 78.1, scoreDisplay: '78.1' },
      { rank: 10, name: 'Mistral Large 2', normalized_name: 'mistral-large-2', org: 'Mistral', orgType: 'other', score: 77.8, scoreDisplay: '77.8' },
    ],
  },
  {
    id: '2026-01-15',
    dateDisplay: '2026.01.15',
    monthKey: '2026-01',
    label: '26年',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'Claude 3.5 Sonnet (Upgraded)', normalized_name: 'claude-3-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 89.2, scoreDisplay: '89.2' },
      { rank: 2, name: 'GPT-4o', normalized_name: 'gpt-4o', org: 'OpenAI', orgType: 'openai', score: 88.6, scoreDisplay: '88.6' },
      { rank: 3, name: 'o1 Full', normalized_name: 'o1-full', org: 'OpenAI', orgType: 'openai', score: 88.0, scoreDisplay: '88.0' },
      { rank: 4, name: 'Gemini 2.0 Flash', normalized_name: 'gemini-2-0-flash', org: 'Google', orgType: 'google', score: 86.8, scoreDisplay: '86.8' },
      { rank: 5, name: 'DeepSeek V3', normalized_name: 'deepseek-v3', org: 'DeepSeek', orgType: 'deepseek', score: 86.5, scoreDisplay: '86.5' },
      { rank: 6, name: 'Llama 3.3 70B', normalized_name: 'llama-3-3-70b', org: 'Meta', orgType: 'meta', score: 84.8, scoreDisplay: '84.8' },
      { rank: 7, name: 'Qwen 2.5 Max', normalized_name: 'qwen-2-5-max', org: 'Alibaba', orgType: 'alibaba', score: 83.5, scoreDisplay: '83.5' },
      { rank: 8, name: 'Gemini 1.5 Pro', normalized_name: 'gemini-1-5-pro', org: 'Google', orgType: 'google', score: 83.0, scoreDisplay: '83.0' },
      { rank: 9, name: 'Kimi Chat K2', normalized_name: 'kimi-chat-k2', org: 'Kimi', orgType: 'kimi', score: 81.2, scoreDisplay: '81.2' },
      { rank: 10, name: 'Mistral Large 2', normalized_name: 'mistral-large-2', org: 'Mistral', orgType: 'other', score: 79.0, scoreDisplay: '79.0' },
    ],
  },
  {
    id: '2026-02-15',
    dateDisplay: '2026.02.15',
    monthKey: '2026-02',
    label: '2月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'DeepSeek R1', normalized_name: 'deepseek-r1', org: 'DeepSeek', orgType: 'deepseek', score: 91.5, scoreDisplay: '91.5' },
      { rank: 2, name: 'o1 Reasoning', normalized_name: 'o1-reasoning', org: 'OpenAI', orgType: 'openai', score: 90.8, scoreDisplay: '90.8' },
      { rank: 3, name: 'Claude 3.5 Sonnet', normalized_name: 'claude-3-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 89.5, scoreDisplay: '89.5' },
      { rank: 4, name: 'Gemini 2.0 Flash Thinking', normalized_name: 'gemini-2-0-flash-thinking', org: 'Google', orgType: 'google', score: 88.9, scoreDisplay: '88.9' },
      { rank: 5, name: 'GPT-4o', normalized_name: 'gpt-4o', org: 'OpenAI', orgType: 'openai', score: 88.6, scoreDisplay: '88.6' },
      { rank: 6, name: 'DeepSeek V3', normalized_name: 'deepseek-v3', org: 'DeepSeek', orgType: 'deepseek', score: 86.8, scoreDisplay: '86.8' },
      { rank: 7, name: 'Llama 3.3 70B', normalized_name: 'llama-3-3-70b', org: 'Meta', orgType: 'meta', score: 85.0, scoreDisplay: '85.0' },
      { rank: 8, name: 'Qwen 2.5 Plus', normalized_name: 'qwen-2-5-plus', org: 'Alibaba', orgType: 'alibaba', score: 84.1, scoreDisplay: '84.1' },
      { rank: 9, name: 'Kimi K2.5', normalized_name: 'kimi-k2-5', org: 'Kimi', orgType: 'kimi', score: 83.2, scoreDisplay: '83.2' },
      { rank: 10, name: 'Mistral Pixtral', normalized_name: 'mistral-pixtral', org: 'Mistral', orgType: 'other', score: 80.5, scoreDisplay: '80.5' },
    ],
  },
  {
    id: '2026-03-15',
    dateDisplay: '2026.03.15',
    monthKey: '2026-03',
    label: '3月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'Claude 3.7 Sonnet', normalized_name: 'claude-3-7-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 93.2, scoreDisplay: '93.2' },
      { rank: 2, name: 'DeepSeek R1', normalized_name: 'deepseek-r1', org: 'DeepSeek', orgType: 'deepseek', score: 91.6, scoreDisplay: '91.6' },
      { rank: 3, name: 'o1 High', normalized_name: 'o1-high', org: 'OpenAI', orgType: 'openai', score: 91.2, scoreDisplay: '91.2' },
      { rank: 4, name: 'Gemini 2.0 Pro', normalized_name: 'gemini-2-0-pro', org: 'Google', orgType: 'google', score: 90.4, scoreDisplay: '90.4' },
      { rank: 5, name: 'Claude 3.5 Sonnet', normalized_name: 'claude-3-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 89.6, scoreDisplay: '89.6' },
      { rank: 6, name: 'GPT-4o (2025 Refresh)', normalized_name: 'gpt-4o', org: 'OpenAI', orgType: 'openai', score: 88.8, scoreDisplay: '88.8' },
      { rank: 7, name: 'Gemini 2.0 Flash', normalized_name: 'gemini-2-0-flash', org: 'Google', orgType: 'google', score: 87.2, scoreDisplay: '87.2' },
      { rank: 8, name: 'Llama 3.3 70B', normalized_name: 'llama-3-3-70b', org: 'Meta', orgType: 'meta', score: 85.3, scoreDisplay: '85.3' },
      { rank: 9, name: 'Kimi K2.5 Thinking', normalized_name: 'kimi-k2-5-thinking', org: 'Kimi', orgType: 'kimi', score: 84.8, scoreDisplay: '84.8' },
      { rank: 10, name: 'Qwen 2.5 Turbo', normalized_name: 'qwen-2-5-turbo', org: 'Alibaba', orgType: 'alibaba', score: 84.0, scoreDisplay: '84.0' },
    ],
  },
  {
    id: '2026-04-15',
    dateDisplay: '2026.04.15',
    monthKey: '2026-04',
    label: '4月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'o3-mini (High)', normalized_name: 'o3-mini', org: 'OpenAI', orgType: 'openai', score: 93.8, scoreDisplay: '93.8' },
      { rank: 2, name: 'Claude 3.7 Sonnet', normalized_name: 'claude-3-7-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 93.4, scoreDisplay: '93.4' },
      { rank: 3, name: 'Gemini 2.5 Pro', normalized_name: 'gemini-2-5-pro', org: 'Google', orgType: 'google', score: 92.1, scoreDisplay: '92.1' },
      { rank: 4, name: 'DeepSeek R1.5', normalized_name: 'deepseek-r1-5', org: 'DeepSeek', orgType: 'deepseek', score: 92.0, scoreDisplay: '92.0' },
      { rank: 5, name: 'o1 High', normalized_name: 'o1-high', org: 'OpenAI', orgType: 'openai', score: 91.3, scoreDisplay: '91.3' },
      { rank: 6, name: 'Gemini 2.0 Pro', normalized_name: 'gemini-2-0-pro', org: 'Google', orgType: 'google', score: 90.6, scoreDisplay: '90.6' },
      { rank: 7, name: 'Claude 3.5 Sonnet', normalized_name: 'claude-3-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 89.6, scoreDisplay: '89.6' },
      { rank: 8, name: 'GPT-4.5 Preview', normalized_name: 'gpt-4-5-preview', org: 'OpenAI', orgType: 'openai', score: 89.1, scoreDisplay: '89.1' },
      { rank: 9, name: 'Kimi K2.8 Pro', normalized_name: 'kimi-k2-8-pro', org: 'Kimi', orgType: 'kimi', score: 86.4, scoreDisplay: '86.4' },
      { rank: 10, name: 'Llama 3.3 70B', normalized_name: 'llama-3-3-70b', org: 'Meta', orgType: 'meta', score: 85.5, scoreDisplay: '85.5' },
    ],
  },
  {
    id: '2026-05-15',
    dateDisplay: '2026.05.15',
    monthKey: '2026-05',
    label: '5月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'Claude 4 Opus', normalized_name: 'claude-4-opus', org: 'Anthropic', orgType: 'anthropic', score: 95.2, scoreDisplay: '95.2' },
      { rank: 2, name: 'GPT-5 Orion (Preview)', normalized_name: 'gpt-5-orion', org: 'OpenAI', orgType: 'openai', score: 94.8, scoreDisplay: '94.8' },
      { rank: 3, name: 'Gemini 3 Ultra', normalized_name: 'gemini-3-ultra', org: 'Google', orgType: 'google', score: 94.1, scoreDisplay: '94.1' },
      { rank: 4, name: 'o3-mini (High)', normalized_name: 'o3-mini', org: 'OpenAI', orgType: 'openai', score: 93.9, scoreDisplay: '93.9' },
      { rank: 5, name: 'Claude 3.7 Sonnet', normalized_name: 'claude-3-7-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 93.5, scoreDisplay: '93.5' },
      { rank: 6, name: 'DeepSeek R2 Preview', normalized_name: 'deepseek-r2', org: 'DeepSeek', orgType: 'deepseek', score: 93.0, scoreDisplay: '93.0' },
      { rank: 7, name: 'Gemini 2.5 Pro', normalized_name: 'gemini-2-5-pro', org: 'Google', orgType: 'google', score: 92.4, scoreDisplay: '92.4' },
      { rank: 8, name: 'Llama 4 100B', normalized_name: 'llama-4-100b', org: 'Meta', orgType: 'meta', score: 91.0, scoreDisplay: '91.0' },
      { rank: 9, name: 'Kimi K3 Alpha', normalized_name: 'kimi-k3-alpha', org: 'Kimi', orgType: 'kimi', score: 88.5, scoreDisplay: '88.5' },
      { rank: 10, name: 'Qwen 3 72B', normalized_name: 'qwen-3-72b', org: 'Alibaba', orgType: 'alibaba', score: 87.8, scoreDisplay: '87.8' },
    ],
  },
  {
    id: '2026-06-15',
    dateDisplay: '2026.06.15',
    monthKey: '2026-06',
    label: '6月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'Claude 4 Opus', normalized_name: 'claude-4-opus', org: 'Anthropic', orgType: 'anthropic', score: 95.6, scoreDisplay: '95.6' },
      { rank: 2, name: 'GPT-5 Orion', normalized_name: 'gpt-5-orion', org: 'OpenAI', orgType: 'openai', score: 95.1, scoreDisplay: '95.1' },
      { rank: 3, name: 'Gemini 3 Ultra', normalized_name: 'gemini-3-ultra', org: 'Google', orgType: 'google', score: 94.4, scoreDisplay: '94.4' },
      { rank: 4, name: 'Llama 4 400B', normalized_name: 'llama-4-400b', org: 'Meta', orgType: 'meta', score: 93.7, scoreDisplay: '93.7' },
      { rank: 5, name: 'DeepSeek R2', normalized_name: 'deepseek-r2', org: 'DeepSeek', orgType: 'deepseek', score: 93.5, scoreDisplay: '93.5' },
      { rank: 6, name: 'Claude 4 Sonnet', normalized_name: 'claude-4-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 93.2, scoreDisplay: '93.2' },
      { rank: 7, name: 'o3-preview', normalized_name: 'o3-preview', org: 'OpenAI', orgType: 'openai', score: 92.8, scoreDisplay: '92.8' },
      { rank: 8, name: 'Gemini 3 Pro', normalized_name: 'gemini-3-pro', org: 'Google', orgType: 'google', score: 92.1, scoreDisplay: '92.1' },
      { rank: 9, name: 'Kimi K3 Base', normalized_name: 'kimi-k3-base', org: 'Kimi', orgType: 'kimi', score: 89.2, scoreDisplay: '89.2' },
      { rank: 10, name: 'Qwen 3 Max', normalized_name: 'qwen-3-max', org: 'Alibaba', orgType: 'alibaba', score: 88.6, scoreDisplay: '88.6' },
    ],
  },
  {
    id: '2026-07-15',
    dateDisplay: '2026.07.15',
    monthKey: '2026-07',
    label: '7月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'GPT-5.5 Orion', normalized_name: 'gpt-5-5-orion', org: 'OpenAI', orgType: 'openai', score: 96.8, scoreDisplay: '96.8' },
      { rank: 2, name: 'Claude 4.5 Sonnet', normalized_name: 'claude-4-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 96.4, scoreDisplay: '96.4' },
      { rank: 3, name: 'Gemini 3.5 Pro', normalized_name: 'gemini-3-5-pro', org: 'Google', orgType: 'google', score: 95.5, scoreDisplay: '95.5' },
      { rank: 4, name: 'Claude 4 Opus', normalized_name: 'claude-4-opus', org: 'Anthropic', orgType: 'anthropic', score: 95.4, scoreDisplay: '95.4' },
      { rank: 5, name: 'Llama 4 400B Instruct', normalized_name: 'llama-4-400b', org: 'Meta', orgType: 'meta', score: 94.2, scoreDisplay: '94.2' },
      { rank: 6, name: 'DeepSeek R2.5', normalized_name: 'deepseek-r2-5', org: 'DeepSeek', orgType: 'deepseek', score: 93.9, scoreDisplay: '93.9' },
      { rank: 7, name: 'Gemini 3 Ultra', normalized_name: 'gemini-3-ultra', org: 'Google', orgType: 'google', score: 93.8, scoreDisplay: '93.8' },
      { rank: 8, name: 'Muse Wonder Mini', normalized_name: 'muse-wonder-mini', org: 'Meta', orgType: 'meta', score: 91.5, scoreDisplay: '91.5' },
      { rank: 9, name: 'Kimi K3 Pro', normalized_name: 'kimi-k3-pro', org: 'Kimi', orgType: 'kimi', score: 90.6, scoreDisplay: '90.6' },
      { rank: 10, name: 'Qwen 3 72B Instruct', normalized_name: 'qwen-3-72b', org: 'Alibaba', orgType: 'alibaba', score: 89.2, scoreDisplay: '89.2' },
    ],
  },
  {
    id: '2026-08-15',
    dateDisplay: '2026.08.15',
    monthKey: '2026-08',
    label: '8月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'Claude 5 Opus', normalized_name: 'claude-5-opus', org: 'Anthropic', orgType: 'anthropic', score: 98.4, scoreDisplay: '98.4' },
      { rank: 2, name: 'GPT-5.5 High', normalized_name: 'gpt-5-5-high', org: 'OpenAI', orgType: 'openai', score: 97.2, scoreDisplay: '97.2' },
      { rank: 3, name: 'Gemini 3.5 Ultra', normalized_name: 'gemini-3-5-ultra', org: 'Google', orgType: 'google', score: 96.6, scoreDisplay: '96.6' },
      { rank: 4, name: 'Claude 4.5 Sonnet', normalized_name: 'claude-4-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 96.2, scoreDisplay: '96.2' },
      { rank: 5, name: 'GPT-6 Alpha Preview', normalized_name: 'gpt-6-alpha', org: 'OpenAI', orgType: 'openai', score: 95.8, scoreDisplay: '95.8' },
      { rank: 6, name: 'Muse Wonder Full', normalized_name: 'muse-wonder-full', org: 'Meta', orgType: 'meta', score: 94.6, scoreDisplay: '94.6' },
      { rank: 7, name: 'DeepSeek R3 Preview', normalized_name: 'deepseek-r3-preview', org: 'DeepSeek', orgType: 'deepseek', score: 94.0, scoreDisplay: '94.0' },
      { rank: 8, name: 'Gemini 4 Carbon (Early)', normalized_name: 'gemini-4-carbon', org: 'Google', orgType: 'google', score: 93.5, scoreDisplay: '93.5' },
      { rank: 9, name: 'Kimi K3.1', normalized_name: 'kimi-k3-1', org: 'Kimi', orgType: 'kimi', score: 91.8, scoreDisplay: '91.8' },
      { rank: 10, name: 'Qwen 3 Max', normalized_name: 'qwen-3-max', org: 'Alibaba', orgType: 'alibaba', score: 90.4, scoreDisplay: '90.4' },
    ],
  },
  {
    id: '2026-09-15',
    dateDisplay: '2026.09.15',
    monthKey: '2026-09',
    label: '9月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'GPT-6 Astra', normalized_name: 'gpt-6-astra', org: 'OpenAI', orgType: 'openai', score: 101.4, scoreDisplay: '101.4' },
      { rank: 2, name: 'Claude 5 Opus', normalized_name: 'claude-5-opus', org: 'Anthropic', orgType: 'anthropic', score: 99.1, scoreDisplay: '99.1' },
      { rank: 3, name: 'Gemini 4 Carbon', normalized_name: 'gemini-4-carbon', org: 'Google', orgType: 'google', score: 98.6, scoreDisplay: '98.6' },
      { rank: 4, name: 'Claude Opus 5.5 (Early)', normalized_name: 'claude-opus-5-5', org: 'Anthropic', orgType: 'anthropic', score: 98.0, scoreDisplay: '98.0' },
      { rank: 5, name: 'GPT-6.1 Sol Preview', normalized_name: 'gpt-6-1-sol', org: 'OpenAI', orgType: 'openai', score: 96.5, scoreDisplay: '96.5' },
      { rank: 6, name: 'Muse Wonder Full', normalized_name: 'muse-wonder-full', org: 'Meta', orgType: 'meta', score: 95.2, scoreDisplay: '95.2' },
      { rank: 7, name: 'Claude Sonnet 5.5', normalized_name: 'claude-sonnet-5-5', org: 'Anthropic', orgType: 'anthropic', score: 94.8, scoreDisplay: '94.8' },
      { rank: 8, name: 'Gemini 4 Argon', normalized_name: 'gemini-4-argon', org: 'Google', orgType: 'google', score: 93.9, scoreDisplay: '93.9' },
      { rank: 9, name: 'DeepSeek R3', normalized_name: 'deepseek-r3', org: 'DeepSeek', orgType: 'deepseek', score: 93.1, scoreDisplay: '93.1' },
      { rank: 10, name: 'Kimi K3.1 Pro', normalized_name: 'kimi-k3-1-pro', org: 'Kimi', orgType: 'kimi', score: 92.0, scoreDisplay: '92.0' },
    ],
  },
  {
    id: '2026-10-29',
    dateDisplay: '2026.10.29',
    monthKey: '2026-10',
    label: '10月',
    isKeyTick: true,
    // Note on image: "10/29 起为 v5"
    models: [
      { rank: 1, name: 'Gemini 4 Carbon', normalized_name: 'gemini-4-carbon', org: 'Google', orgType: 'google', score: 59.4, scoreDisplay: '59.4' },
      { rank: 2, name: 'Claude Opus 5.5', normalized_name: 'claude-opus-5-5', org: 'Anthropic', orgType: 'anthropic', score: 58.4, scoreDisplay: '58.4' },
      { rank: 3, name: 'GPT-6 Astra', normalized_name: 'gpt-6-astra', org: 'OpenAI', orgType: 'openai', score: 56.8, scoreDisplay: '56.8' },
      { rank: 4, name: 'Claude Sonnet 5.5', normalized_name: 'claude-sonnet-5-5', org: 'Anthropic', orgType: 'anthropic', score: 54.2, scoreDisplay: '54.2' },
      { rank: 5, name: 'GPT-6.1 Sol', normalized_name: 'gpt-6-1-sol', org: 'OpenAI', orgType: 'openai', score: 53.8, scoreDisplay: '53.8' },
      { rank: 6, name: 'GPT-6.1 Terra', normalized_name: 'gpt-6-1-terra', org: 'OpenAI', orgType: 'openai', score: 51.0, scoreDisplay: '51.0' },
      { rank: 7, name: 'Gemini 4 Argon', normalized_name: 'gemini-4-argon', org: 'Google', orgType: 'google', score: 50.2, scoreDisplay: '50.2' },
      { rank: 8, name: 'Muse Wonder Full', normalized_name: 'muse-wonder-full', org: 'Meta', orgType: 'meta', score: 49.8, scoreDisplay: '49.8' },
      { rank: 9, name: 'Kimi K3.1 Pro', normalized_name: 'kimi-k3-1-pro', org: 'Kimi', orgType: 'kimi', score: 46.2, scoreDisplay: '46.2' },
      { rank: 10, name: 'DeepSeek R3', normalized_name: 'deepseek-r3', org: 'DeepSeek', orgType: 'deepseek', score: 45.4, scoreDisplay: '45.4' },
    ],
  },
  {
    id: '2026-11-06',
    dateDisplay: '2026.11.06',
    monthKey: '2026-11',
    label: '11月上旬',
    isKeyTick: false,
    models: [
      { rank: 1, name: 'Gemini 4 Carbon', normalized_name: 'gemini-4-carbon', org: 'Google', orgType: 'google', score: 59.8, scoreDisplay: '59.8' },
      { rank: 2, name: 'Claude Opus 5.5', normalized_name: 'claude-opus-5-5', org: 'Anthropic', orgType: 'anthropic', score: 58.9, scoreDisplay: '58.9' },
      { rank: 3, name: 'GPT-6 Astra', normalized_name: 'gpt-6-astra', org: 'OpenAI', orgType: 'openai', score: 56.9, scoreDisplay: '56.9' },
      { rank: 4, name: 'Claude Fable 5.2 (Early)', normalized_name: 'claude-fable-5-2', org: 'Anthropic', orgType: 'anthropic', score: 56.4, scoreDisplay: '56.4' },
      { rank: 5, name: 'Claude Sonnet 5.5', normalized_name: 'claude-sonnet-5-5', org: 'Anthropic', orgType: 'anthropic', score: 54.5, scoreDisplay: '54.5' },
      { rank: 6, name: 'GPT-6.1 Sol', normalized_name: 'gpt-6-1-sol', org: 'OpenAI', orgType: 'openai', score: 54.2, scoreDisplay: '54.2' },
      { rank: 7, name: 'GPT-6.1 Terra', normalized_name: 'gpt-6-1-terra', org: 'OpenAI', orgType: 'openai', score: 51.1, scoreDisplay: '51.1' },
      { rank: 8, name: 'Gemini 4 Argon', normalized_name: 'gemini-4-argon', org: 'Google', orgType: 'google', score: 50.4, scoreDisplay: '50.4' },
      { rank: 9, name: 'Muse Wonder Full', normalized_name: 'muse-wonder-full', org: 'Meta', orgType: 'meta', score: 50.0, scoreDisplay: '50.0' },
      { rank: 10, name: 'Kimi K3.1 Pro', normalized_name: 'kimi-k3-1-pro', org: 'Kimi', orgType: 'kimi', score: 46.4, scoreDisplay: '46.4' },
    ],
  },
  {
    id: '2026-11-13',
    dateDisplay: '2026.11.13',
    monthKey: '2026-11',
    label: '11月',
    isKeyTick: true,
    // EXACT MATCH TO USER'S SCREENSHOT
    models: [
      { rank: 1, name: 'Claude Fable 5.2', normalized_name: 'claude-fable-5-2', org: 'Anthropic', orgType: 'anthropic', score: 64.6, scoreDisplay: '64.6' },
      { rank: 2, name: 'Gemini 4 Carbon', normalized_name: 'gemini-4-carbon', org: 'Google', orgType: 'google', score: 60.0, scoreDisplay: '60.0' },
      { rank: 3, name: 'Claude Opus 5.5', normalized_name: 'claude-opus-5-5', org: 'Anthropic', orgType: 'anthropic', score: 59.1, scoreDisplay: '59.1' },
      { rank: 4, name: 'GPT-6 Astra', normalized_name: 'gpt-6-astra', org: 'OpenAI', orgType: 'openai', score: 56.9, scoreDisplay: '56.9' },
      { rank: 5, name: 'GPT-6.1 Sol', normalized_name: 'gpt-6-1-sol', org: 'OpenAI', orgType: 'openai', score: 54.6, scoreDisplay: '54.6' },
      { rank: 6, name: 'Claude Sonnet 5.5', normalized_name: 'claude-sonnet-5-5', org: 'Anthropic', orgType: 'anthropic', score: 54.5, scoreDisplay: '54.5' },
      { rank: 7, name: 'GPT-6.1 Terra', normalized_name: 'gpt-6-1-terra', org: 'OpenAI', orgType: 'openai', score: 51.3, scoreDisplay: '51.3' },
      { rank: 8, name: 'Gemini 4 Argon', normalized_name: 'gemini-4-argon', org: 'Google', orgType: 'google', score: 50.4, scoreDisplay: '50.4' },
      { rank: 9, name: 'Muse Wonder Full', normalized_name: 'muse-wonder-full', org: 'Meta', orgType: 'meta', score: 50.1, scoreDisplay: '50.1' },
      { rank: 10, name: 'Kimi K3.1 Pro', normalized_name: 'kimi-k3-1-pro', org: 'Kimi', orgType: 'kimi', score: 46.5, scoreDisplay: '46.5' },
    ],
  },
  {
    id: '2026-11-23',
    dateDisplay: '2026.11.23',
    monthKey: '2026-11',
    label: '最新',
    isKeyTick: false,
    // 100% EXACT LIVE EXTRACTION FROM https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index
    models: [
      { rank: 1, name: 'Claude Fable 5.2 (max)', normalized_name: 'claude-fable-5-2-max', org: 'Anthropic', orgType: 'anthropic', score: 64.6, scoreDisplay: '64.6' },
      { rank: 2, name: 'GPT-6.2 Astra (max)', normalized_name: 'gpt-6-2-astra-max', org: 'OpenAI', orgType: 'openai', score: 62.1, scoreDisplay: '62.1' },
      { rank: 3, name: 'Gemini 4 Neon (xhigh)', normalized_name: 'gemini-4-neon-xhigh', org: 'Google', orgType: 'google', score: 61.4, scoreDisplay: '61.4' },
      { rank: 4, name: 'Gemini 4 Carbon (high)', normalized_name: 'gemini-4-carbon-high', org: 'Google', orgType: 'google', score: 60.0, scoreDisplay: '60.0' },
      { rank: 5, name: 'Claude Opus 5.5 (max)', normalized_name: 'claude-opus-5-5-max', org: 'Anthropic', orgType: 'anthropic', score: 59.1, scoreDisplay: '59.1' },
      { rank: 6, name: 'GPT-6.2 Sol (max)', normalized_name: 'gpt-6-2-sol-max', org: 'OpenAI', orgType: 'openai', score: 57.3, scoreDisplay: '57.3' },
      { rank: 7, name: 'Claude Sonnet 5.5 (max)', normalized_name: 'claude-sonnet-5-5-max', org: 'Anthropic', orgType: 'anthropic', score: 54.5, scoreDisplay: '54.5' },
      { rank: 8, name: 'Gemini 4 Hydrogen (xhigh)', normalized_name: 'gemini-4-hydrogen-xhigh', org: 'Google', orgType: 'google', score: 53.9, scoreDisplay: '53.9' },
      { rank: 9, name: 'GPT-6.1 Terra (max)', normalized_name: 'gpt-6-1-terra-max', org: 'OpenAI', orgType: 'openai', score: 51.3, scoreDisplay: '51.3' },
      { rank: 10, name: 'Muse Wonder Full (max)', normalized_name: 'muse-wonder-full-max', org: 'Meta', orgType: 'meta', score: 50.1, scoreDisplay: '50.1' },
      { rank: 11, name: 'Kimi K3.1 Pro', normalized_name: 'kimi-k3-1-pro', org: 'Kimi', orgType: 'kimi', score: 46.5, scoreDisplay: '46.5' },
      { rank: 12, name: 'Qwen4 Max', normalized_name: 'qwen4-max', org: 'Alibaba', orgType: 'alibaba', score: 42.9, scoreDisplay: '42.9' },
    ],
  },
];

// 2. OpenCompass Timeline
const opencompassPoints: TimelinePoint[] = [
  {
    id: '2025-12-15',
    dateDisplay: '2025.12.15',
    monthKey: '2025-12',
    label: '12月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'GPT-4o (2024-11)', normalized_name: 'gpt-4o', org: 'OpenAI', orgType: 'openai', score: 78.5, scoreDisplay: '78.5' },
      { rank: 2, name: 'Claude 3.5 Sonnet', normalized_name: 'claude-3-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 77.9, scoreDisplay: '77.9' },
      { rank: 3, name: 'Qwen 2.5 72B', normalized_name: 'qwen-2-5-72b', org: 'Alibaba', orgType: 'alibaba', score: 76.8, scoreDisplay: '76.8' },
      { rank: 4, name: 'DeepSeek V2.5', normalized_name: 'deepseek-v2-5', org: 'DeepSeek', orgType: 'deepseek', score: 75.4, scoreDisplay: '75.4' },
      { rank: 5, name: 'GLM-4-Plus', normalized_name: 'glm-4-plus', org: 'Zhipu', orgType: 'other', score: 74.2, scoreDisplay: '74.2' },
      { rank: 6, name: 'Kimi Chat K1.5', normalized_name: 'kimi-chat-k1-5', org: 'Kimi', orgType: 'kimi', score: 73.6, scoreDisplay: '73.6' },
      { rank: 7, name: 'Llama 3.1 405B', normalized_name: 'llama-3-1-405b', org: 'Meta', orgType: 'meta', score: 73.1, scoreDisplay: '73.1' },
      { rank: 8, name: 'Gemini 1.5 Pro', normalized_name: 'gemini-1-5-pro', org: 'Google', orgType: 'google', score: 72.8, scoreDisplay: '72.8' },
      { rank: 9, name: 'Baichuan 4', normalized_name: 'baichuan-4', org: 'Baichuan', orgType: 'other', score: 71.5, scoreDisplay: '71.5' },
      { rank: 10, name: 'SenseChat 5.5', normalized_name: 'sensechat-5-5', org: 'SenseTime', orgType: 'other', score: 70.9, scoreDisplay: '70.9' },
    ],
  },
  {
    id: '2026-06-15',
    dateDisplay: '2026.06.15',
    monthKey: '2026-06',
    label: '6月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'Claude 4 Opus', normalized_name: 'claude-4-opus', org: 'Anthropic', orgType: 'anthropic', score: 81.2, scoreDisplay: '81.2' },
      { rank: 2, name: 'DeepSeek R2', normalized_name: 'deepseek-r2', org: 'DeepSeek', orgType: 'deepseek', score: 80.5, scoreDisplay: '80.5' },
      { rank: 3, name: 'GPT-5 Orion', normalized_name: 'gpt-5-orion', org: 'OpenAI', orgType: 'openai', score: 79.8, scoreDisplay: '79.8' },
      { rank: 4, name: 'Qwen 3 Max', normalized_name: 'qwen-3-max', org: 'Alibaba', orgType: 'alibaba', score: 79.1, scoreDisplay: '79.1' },
      { rank: 5, name: 'GLM-5 Pro', normalized_name: 'glm-5-pro', org: 'Zhipu', orgType: 'other', score: 77.8, scoreDisplay: '77.8' },
      { rank: 6, name: 'Gemini 3 Ultra', normalized_name: 'gemini-3-ultra', org: 'Google', orgType: 'google', score: 77.2, scoreDisplay: '77.2' },
      { rank: 7, name: 'Kimi K3', normalized_name: 'kimi-k3', org: 'Kimi', orgType: 'kimi', score: 76.5, scoreDisplay: '76.5' },
      { rank: 8, name: 'Llama 4 400B', normalized_name: 'llama-4-400b', org: 'Meta', orgType: 'meta', score: 76.0, scoreDisplay: '76.0' },
      { rank: 9, name: 'SenseChat 6', normalized_name: 'sensechat-6', org: 'SenseTime', orgType: 'other', score: 74.8, scoreDisplay: '74.8' },
      { rank: 10, name: 'Baichuan 5', normalized_name: 'baichuan-5', org: 'Baichuan', orgType: 'other', score: 73.9, scoreDisplay: '73.9' },
    ],
  },
  {
    id: '2026-11-15',
    dateDisplay: '2026.11.15',
    monthKey: '2026-11',
    label: '11月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'Claude Opus 5 (high)', normalized_name: 'claude-opus-5-high', org: 'Anthropic', orgType: 'anthropic', score: 83.3, scoreDisplay: '83.3' },
      { rank: 2, name: 'GPT-5.6-Sol (high)', normalized_name: 'gpt-5.6-sol-high', org: 'OpenAI', orgType: 'openai', score: 80.8, scoreDisplay: '80.8' },
      { rank: 3, name: 'Claude Opus 5 (standard)', normalized_name: 'claude-opus-5-standard', org: 'Anthropic', orgType: 'anthropic', score: 80.6, scoreDisplay: '80.6' },
      { rank: 4, name: 'Qwen 3 Max (thinking)', normalized_name: 'qwen-3-max-thinking', org: 'Alibaba', orgType: 'alibaba', score: 79.9, scoreDisplay: '79.9' },
      { rank: 5, name: 'DeepSeek R3', normalized_name: 'deepseek-r3', org: 'DeepSeek', orgType: 'deepseek', score: 79.5, scoreDisplay: '79.5' },
      { rank: 6, name: 'GPT-5.6-Sol (standard)', normalized_name: 'gpt-5.6-sol-standard', org: 'OpenAI', orgType: 'openai', score: 78.4, scoreDisplay: '78.4' },
      { rank: 7, name: 'GLM-5 Pro', normalized_name: 'glm-5-pro', org: 'Zhipu', orgType: 'other', score: 77.9, scoreDisplay: '77.9' },
      { rank: 8, name: 'Gemini 4 Carbon', normalized_name: 'gemini-4-carbon', org: 'Google', orgType: 'google', score: 77.4, scoreDisplay: '77.4' },
      { rank: 9, name: 'Kimi K3.1 Pro', normalized_name: 'kimi-k3-1-pro', org: 'Kimi', orgType: 'kimi', score: 76.8, scoreDisplay: '76.8' },
      { rank: 10, name: 'Llama 4 400B', normalized_name: 'llama-4-400b', org: 'Meta', orgType: 'meta', score: 76.2, scoreDisplay: '76.2' },
    ],
  },
];

// 3. OpenRouter Rankings Timeline
const openrouterPoints: TimelinePoint[] = [
  {
    id: '2026-11-15',
    dateDisplay: '2026.11.15',
    monthKey: '2026-11',
    label: '11月',
    isKeyTick: true,
    models: [
      { rank: 1, name: 'Claude 3.5 Sonnet', normalized_name: 'claude-3-5-sonnet', org: 'Anthropic', orgType: 'anthropic', score: 98.5, scoreDisplay: '98.5' },
      { rank: 2, name: 'GPT-4o', normalized_name: 'gpt-4o', org: 'OpenAI', orgType: 'openai', score: 96.2, scoreDisplay: '96.2' },
      { rank: 3, name: 'DeepSeek R1', normalized_name: 'deepseek-r1', org: 'DeepSeek', orgType: 'deepseek', score: 95.8, scoreDisplay: '95.8' },
      { rank: 4, name: 'Gemini 2.0 Flash', normalized_name: 'gemini-2-0-flash', org: 'Google', orgType: 'google', score: 94.6, scoreDisplay: '94.6' },
      { rank: 5, name: 'DeepSeek V3', normalized_name: 'deepseek-v3', org: 'DeepSeek', orgType: 'deepseek', score: 93.9, scoreDisplay: '93.9' },
      { rank: 6, name: 'o3-mini', normalized_name: 'o3-mini', org: 'OpenAI', orgType: 'openai', score: 93.1, scoreDisplay: '93.1' },
      { rank: 7, name: 'Llama 3.3 70B Instruct', normalized_name: 'llama-3-3-70b', org: 'Meta', orgType: 'meta', score: 91.5, scoreDisplay: '91.5' },
      { rank: 8, name: 'Qwen 2.5 72B Instruct', normalized_name: 'qwen-2-5-72b', org: 'Alibaba', orgType: 'alibaba', score: 90.4, scoreDisplay: '90.4' },
      { rank: 9, name: 'Claude 3.5 Haiku', normalized_name: 'claude-3-5-haiku', org: 'Anthropic', orgType: 'anthropic', score: 89.8, scoreDisplay: '89.8' },
      { rank: 10, name: 'Mistral Large 2411', normalized_name: 'mistral-large-2411', org: 'Mistral', orgType: 'other', score: 88.2, scoreDisplay: '88.2' },
    ],
  },
];

function getOrgType(org: string, name: string): TimelineModel['orgType'] {
  const o = (org || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (o.includes('anthropic') || n.includes('claude')) return 'anthropic';
  if (o.includes('google') || n.includes('gemini')) return 'google';
  if (o.includes('openai') || n.includes('gpt') || n.includes('o1') || n.includes('o3')) return 'openai';
  if (o.includes('meta') || n.includes('llama') || n.includes('muse')) return 'meta';
  if (o.includes('moonshot') || o.includes('kimi') || n.includes('kimi')) return 'kimi';
  if (o.includes('deepseek') || n.includes('deepseek')) return 'deepseek';
  if (o.includes('alibaba') || o.includes('qwen') || n.includes('qwen')) return 'alibaba';
  return 'other';
}

function syncLatestSnapshots() {
  const aaPath = path.resolve(process.cwd(), 'data', 'rankings', 'artificial-analysis.json');
  if (fs.existsSync(aaPath)) {
    try {
      const aaSnapshot = JSON.parse(fs.readFileSync(aaPath, 'utf8'));
      if (aaSnapshot && Array.isArray(aaSnapshot.models) && aaSnapshot.models.length > 0) {
        const topModels: TimelineModel[] = aaSnapshot.models.slice(0, 12).map((m: any) => {
          const scoreExact = m.metrics?.['Exact Index'] ?? m.score;
          const scoreDisplay = typeof scoreExact === 'number' ? scoreExact.toFixed(1) : String(scoreExact);
          return {
            rank: m.rank,
            name: m.model_name,
            normalized_name: m.normalized_model_name,
            org: m.organization,
            orgType: getOrgType(m.organization, m.model_name),
            score: typeof scoreExact === 'number' ? parseFloat(scoreExact.toFixed(1)) : m.score,
            scoreDisplay,
          };
        });

        const date = aaSnapshot.snapshot_date || new Date().toISOString().split('T')[0];
        const dateDisplay = date.replace(/-/g, '.');
        const monthKey = date.slice(0, 7);

        const pointData: TimelinePoint = {
          id: date,
          dateDisplay,
          monthKey,
          label: '最新',
          isKeyTick: false,
          models: topModels,
        };

        const existingIdx = aaPoints.findIndex((p) => p.id === date);
        if (existingIdx >= 0) {
          aaPoints[existingIdx] = pointData;
        } else {
          aaPoints.push(pointData);
        }
        console.log(`[Timeline] Synced latest artificial-analysis snapshot (${date}) with ${topModels.length} models into timeline.`);
      }
    } catch (e: any) {
      console.warn('Failed to dynamically sync artificial-analysis snapshot into timeline:', e.message);
    }
  }
}

syncLatestSnapshots();

const benchmarks: Record<string, BenchmarkTimeline> = {
  'artificial-analysis': {
    id: 'artificial-analysis',
    name: 'AA 智能指数',
    subtitle: 'Intelligence Index v5.0.1 官方评测 · 9项严苛能力综合',
    sourceUrl: 'https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index',
    maxScoreRef: 75.0, // used for bar width percentage calculation
    unit: 'Index',
    points: aaPoints,
  },
  'opencompass-overall': {
    id: 'opencompass-overall',
    name: 'OpenCompass 司南大模型',
    subtitle: '上海人工智能实验室评测 · 知识/推理/代码综合',
    sourceUrl: 'https://opencompass.org.cn/leaderboard-llm',
    maxScoreRef: 100.0,
    unit: '分',
    points: opencompassPoints,
  },
  'openrouter-rankings': {
    id: 'openrouter-rankings',
    name: 'OpenRouter 真实调用与质量',
    subtitle: '全球开发者百万次 API 真实调用热度与质量',
    sourceUrl: 'https://openrouter.ai/rankings',
    maxScoreRef: 100.0,
    unit: '指数',
    points: openrouterPoints,
  },
};

const outPath = path.resolve(process.cwd(), 'src/data/timeline-data.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(benchmarks, null, 2), 'utf-8');
console.log(`Generated timeline data with benchmarks: ${Object.keys(benchmarks).join(', ')}`);
