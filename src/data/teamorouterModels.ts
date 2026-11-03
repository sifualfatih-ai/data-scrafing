/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamoModel {
  id: string;
  name: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'DEEPSEEK' | 'GLM';
  pricing?: string;
  isRecommended?: boolean;
}

export const TEAMOROUTER_MODELS: TeamoModel[] = [
  // GOOGLE
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'GOOGLE', pricing: '$0.75 / $3.75', isRecommended: true },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', provider: 'GOOGLE', pricing: '$0.75 / $3.75' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'GOOGLE', pricing: '$0.75 / $3.75' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'GOOGLE', pricing: '$1.50 / $9' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', provider: 'GOOGLE', pricing: '$0.30 / $2.50' },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', provider: 'GOOGLE', pricing: '$2 / $10' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', provider: 'GOOGLE', pricing: '$2 / $12' },
  { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro Image', provider: 'GOOGLE', pricing: '$2 / $120' },
  { id: 'nano-banana-2.1', name: 'Nano Banana 2.1', provider: 'GOOGLE', pricing: '$1.50 / $30' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Upstream Sering Offline)', provider: 'GOOGLE', pricing: '$0.30 / $1.20' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'GOOGLE', pricing: '$0.30 / $1.20' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'GOOGLE', pricing: '$0.30 / $1.20' },

  // OPENAI
  { id: 'gpt-5.4-mini', name: 'GPT-5.4-Mini', provider: 'OPENAI', pricing: '$0.75 / $4.50', isRecommended: true },
  { id: 'gpt-5.4', name: 'GPT-5.4', provider: 'OPENAI', pricing: '$2.50 / $15' },
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OPENAI', pricing: '$5 / $30' },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', provider: 'OPENAI', pricing: '$0.20 / $1.20' },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', provider: 'OPENAI', pricing: '$2 / $12' },
  { id: 'gpt-5.6-terra-fast', name: 'GPT-5.6 Terra (Fast)', provider: 'OPENAI', pricing: '$4 / $24' },
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', provider: 'OPENAI', pricing: '$5 / $30' },
  { id: 'gpt-5.6-sol-fast', name: 'GPT-5.6 Sol (Fast)', provider: 'OPENAI', pricing: '$10 / $60' },
  { id: 'gpt-6-luna', name: 'GPT-6 Luna', provider: 'OPENAI', pricing: '$0.10 / $0.50' },
  { id: 'gpt-6-sol', name: 'GPT-6 Sol', provider: 'OPENAI', pricing: '$2 / $10' },
  { id: 'gpt-6-astra', name: 'GPT-6 Astra', provider: 'OPENAI', pricing: '$10 / $50' },
  { id: 'gpt-6-astra-fast', name: 'GPT-6 Astra (Fast)', provider: 'OPENAI', pricing: '$20 / $100' },
  { id: 'gpt-6.1-sol', name: 'GPT 6.1 Sol', provider: 'OPENAI', pricing: '$2 / $10' },
  { id: 'gpt-6.1-terra', name: 'GPT 6.1 Terra', provider: 'OPENAI', pricing: '$1 / $5' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OPENAI', pricing: '$0.15 / $0.60' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OPENAI', pricing: '$2.50 / $10' },
  { id: 'gpt-image-2', name: 'GPT Image 2', provider: 'OPENAI', pricing: '$5 / $30' },
  { id: 'gpt-image-2.5-flare', name: 'GPT Image 2.5 Flare', provider: 'OPENAI', pricing: '$5 / $30' },
  { id: 'gpt-image-2.5-sunburst', name: 'GPT Image 2.5 Sunburst', provider: 'OPENAI', pricing: '$5 / $30' },

  // ANTHROPIC
  { id: 'claude-haiku-5.5', name: 'Claude Haiku 5.5 (Cepat & Murah)', provider: 'ANTHROPIC', pricing: '$0.10 / $0.50', isRecommended: true },
  { id: 'claude-sonnet-5.5', name: 'Claude Sonnet 5.5', provider: 'ANTHROPIC', pricing: '$2 / $10', isRecommended: true },
  { id: 'claude-opus-5.5', name: 'Claude Opus 5.5', provider: 'ANTHROPIC', pricing: '$4 / $20' },
  { id: 'claude-opus-5', name: 'Claude Opus 5', provider: 'ANTHROPIC', pricing: '$5 / $25' },
  { id: 'claude-fable-5.1', name: 'Claude Fable 5.1', provider: 'ANTHROPIC', pricing: '$10 / $50' },
  { id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'ANTHROPIC', pricing: '$10 / $50' },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', provider: 'ANTHROPIC', pricing: '$2 / $10' },
  { id: 'claude-opus-4.8', name: 'Claude Opus 4.8', provider: 'ANTHROPIC', pricing: '$5 / $25' },
  { id: 'claude-opus-4.7', name: 'Claude Opus 4.7', provider: 'ANTHROPIC', pricing: '$5 / $25' },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'ANTHROPIC', pricing: '$3 / $15' },
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'ANTHROPIC', pricing: '$5 / $25' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'ANTHROPIC', pricing: '$1 / $5' },
  { id: 'claude-haiku-4.5-20251001', name: 'Claude Haiku 4.5 (20251001)', provider: 'ANTHROPIC', pricing: '$1 / $5' },

  // DEEPSEEK
  { id: 'deepseek-v4.1-flash', name: 'DeepSeek V4.1 Flash', provider: 'DEEPSEEK', pricing: '$0.30 / $1.20', isRecommended: true },
  { id: 'deepseek-v4.1-flash-1017', name: 'DeepSeek V4.1 Flash 1017', provider: 'DEEPSEEK', pricing: '$0.30 / $1.20' },
  { id: 'deepseek-v4.1-flash-free', name: 'DeepSeek V4.1 Flash福利版', provider: 'DEEPSEEK', pricing: 'Free tier' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DEEPSEEK', pricing: '$0.44 / $1.32' },
  { id: 'deepseek-v4-flash-free', name: 'DeepSeek V4 Flash福利版', provider: 'DEEPSEEK', pricing: 'Free tier' },
  { id: 'deepseek-v4-flash-vision-exp', name: 'DeepSeek V4 Flash Vision Exp', provider: 'DEEPSEEK', pricing: '$0.44 / $1.32' },
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro 正式版', provider: 'DEEPSEEK', pricing: '$1.32 / $3.96' },
  { id: 'deepseek-v4-pro-260425', name: 'DeepSeek V4 Pro 260425', provider: 'DEEPSEEK', pricing: '$1.74 / $3.48' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DEEPSEEK', pricing: '$0.27 / $1.10' },

  // GLM
  { id: 'glm-5.3-flash-ox-alpha', name: 'GLM-5.3-Flash (Ox Alpha)', provider: 'GLM', pricing: '$0.11 / $0.40', isRecommended: true },
  { id: 'glm-5.3-flash', name: 'GLM 5.3 Flash福利版', provider: 'GLM', pricing: 'Free tier' },
  { id: 'glm-5.3', name: 'GLM-5.3', provider: 'GLM', pricing: '$1.40 / $4.40' },
  { id: 'glm-5.2', name: 'GLM-5.2', provider: 'GLM', pricing: '$1.40 / $4.40' },
];

export const PROVIDERS = ['GOOGLE', 'OPENAI', 'ANTHROPIC', 'DEEPSEEK', 'GLM'] as const;
