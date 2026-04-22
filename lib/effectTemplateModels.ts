import type { AdminEffectTemplateType } from '@/hooks/useAdmin';

export const PHOTO_EFFECT_MODELS = [
  'nano-banana-2',
  'nano-banana-pro',
  'flux',
] as const;

export const VIDEO_EFFECT_MODELS = [
  'kling',
  'higgsfield-video',
  'minimax-hailuo',
  'grok-video',
] as const;

export const MODEL_PROVIDER_MAP: Record<string, string> = {
  'nano-banana-2': 'nano',
  'nano-banana-pro': 'nano-pro',
  flux: 'flux',
  'higgsfield-video': 'higgsfield',
  kling: 'kling',
  'minimax-hailuo': 'hailuo/minimax-2.3',
  'grok-video': 'grok-video',
};

export const getModelsForType = (
  type: AdminEffectTemplateType,
): readonly string[] => {
  if (type === 'photo_effect') return PHOTO_EFFECT_MODELS;
  return VIDEO_EFFECT_MODELS;
};

export const defaultModelForType = (type: AdminEffectTemplateType) =>
  getModelsForType(type)[0];

export const resolveModelForType = (
  type: AdminEffectTemplateType,
  current: string,
): string => {
  const list = getModelsForType(type);
  if (list.includes(current)) return current;
  return list[0];
};

export const providerForModel = (
  model: string,
  type: AdminEffectTemplateType,
) => {
  const p = MODEL_PROVIDER_MAP[model];
  if (p) return p;
  return type === 'photo_effect' ? 'nano' : 'kling';
};

export const templateModelToSelectValue = (
  type: AdminEffectTemplateType,
  modelParams: Record<string, unknown> | null | undefined,
): string => {
  const raw =
    modelParams && typeof modelParams === 'object'
      ? modelParams['model']
      : undefined;
  const s = typeof raw === 'string' ? raw.trim() : '';
  const list = [...getModelsForType(type)];
  if (s && list.includes(s)) return s;
  if (type !== 'photo_effect') {
    if (!s) return defaultModelForType(type);
    const lower = s.toLowerCase();
    if (lower === 'kling' || lower.startsWith('kling/'))
      return list.includes('kling') ? 'kling' : list[0];
    if (lower.includes('higgsfield'))
      return list.includes('higgsfield-video') ? 'higgsfield-video' : list[0];
    if (lower.includes('hailuo') || lower.includes('minimax'))
      return list.includes('minimax-hailuo') ? 'minimax-hailuo' : list[0];
    if (lower.includes('grok'))
      return list.includes('grok-video') ? 'grok-video' : list[0];
    return list[0];
  }
  if (!s) return defaultModelForType(type);
  const lower = s.toLowerCase();
  if (lower.includes('nano-banana-pro') || lower.includes('pro'))
    return list.includes('nano-banana-pro') ? 'nano-banana-pro' : list[0];
  if (
    lower.includes('nano-banana') ||
    lower.includes('gemini') ||
    lower.includes('banana')
  )
    return list.includes('nano-banana-2') ? 'nano-banana-2' : list[0];
  if (lower.includes('flux') || lower.includes('bfl'))
    return list.includes('flux') ? 'flux' : list[0];
  return list[0];
};
