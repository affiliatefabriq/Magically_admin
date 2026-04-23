import type { AdminEffectTemplateType } from '@/hooks/useAdmin';

export const PHOTO_EFFECT_MODELS = [
  'nano-banana-2',
  'nano-banana-pro',
  'flux',
] as const;

export const VIDEO_EFFECT_MODELS = [
  'kling-v3',
  'kling-v2.5',
  'higgsfield-cinematic',
  'minimax-hailuo',
] as const;

export const MODEL_PROVIDER_MAP: Record<string, string> = {
  'nano-banana-2': 'nano',
  'nano-banana-pro': 'nano-pro',
  flux: 'flux',
  'kling-v3': 'kling',
  'kling-v2.5': 'kling',
  'higgsfield-cinematic': 'higgsfield',
  'minimax-hailuo': 'minimax-hailuo',
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
  if (type !== 'photo_effect') {
    const normalized = normalizeVideoModelAlias(current);
    if (normalized && list.includes(normalized)) return normalized;
  }
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
    const normalized = normalizeVideoModelAlias(s);
    if (normalized && list.includes(normalized)) return normalized;
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

function normalizeVideoModelAlias(value: string): string | null {
  const lower = value.trim().toLowerCase();
  if (!lower) return null;
  if (
    lower === 'kling' ||
    lower === 'kling-v3' ||
    lower === 'kling-3.0' ||
    lower === 'kling/v3.0' ||
    lower === 'kuaishou/kling-3.0' ||
    lower === 'kuaishou/kling-3.0-video'
  ) {
    return 'kling-v3';
  }
  if (
    lower === 'kling-v2.5' ||
    lower === 'kling-2.5' ||
    lower === 'kling/v2.5' ||
    lower === 'kuaishou/kling-2.5' ||
    lower === 'kuaishou/kling-2.5-turbo-video'
  ) {
    return 'kling-v2.5';
  }
  if (
    lower === 'higgsfield' ||
    lower === 'higgsfield-video' ||
    lower === 'higgsfield-cinematic' ||
    lower === 'higgsfield/cinematic-studio-video'
  ) {
    return 'higgsfield-cinematic';
  }
  if (
    lower === 'minimax' ||
    lower === 'hailuo' ||
    lower === 'minimax-hailuo' ||
    lower === 'hailuo/minimax-2.3'
  ) {
    return 'minimax-hailuo';
  }
  return null;
}
