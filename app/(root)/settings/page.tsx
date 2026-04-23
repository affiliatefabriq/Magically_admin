'use client';

import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useAdmin';
import {
  ChevronDown,
  Loader2,
  Save,
  ImageIcon,
  Video,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type StateKey = 'guest' | 'noModel' | 'hasModel';

type FormState = {
  imageCost: number;
  videoCost: number;
  videoPricePerSecond: number;
  photoEffectCost: number;
  videoEffectCost: number;
  aiCost1K: number;
  aiCost2K: number;
  systemPrompt: string;
  nanoBananaSystemPrompt: string;
  fluxSystemPrompt: string;
  trialTokens: number;
  referralRewardTokens: number;
  trialPeriodDays: number;
  subscriptionGracePeriodDays: number;
  titlesEn: Record<StateKey, string[]>;
  titlesRu: Record<StateKey, string[]>;
  lkTextsEn: {
    exploreCommunityTitle: string;
    exploreCommunityDescription: string;
    payTitle: string;
    payDescription: string;
    payAmountLabel: string;
    payButtonLabel: string;
    payCreateNewButton: string;
    profileTitle: string;
    profileDescription: string;
  };
  lkTextsRu: {
    exploreCommunityTitle: string;
    exploreCommunityDescription: string;
    payTitle: string;
    payDescription: string;
    payAmountLabel: string;
    payButtonLabel: string;
    payCreateNewButton: string;
    profileTitle: string;
    profileDescription: string;
  };
  effectRouting: {
    photo_effect: { models: string[] };
    video_effect: { models: string[] };
    live_photo_template: { models: string[] };
  };
};

const parseLines = (value: string) =>
  value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);

const defaultRouting = {
  photo_effect: { models: ['nano-banana-2', 'nano-banana-pro'] },
  video_effect: {
    models: ['kling', 'higgsfield-video', 'minimax-hailuo', 'grok-video'],
  },
  live_photo_template: {
    models: ['kling', 'higgsfield-video', 'minimax-hailuo', 'grok-video'],
  },
};

type SectionKey =
  | 'pricing'
  | 'trial'
  | 'prompts'
  | 'routing'
  | 'referral'
  | 'typewriterRu'
  | 'typewriterEn'
  | 'lkRu'
  | 'lkEn';

const SECTION_KEYS: SectionKey[] = [
  'pricing',
  'trial',
  'prompts',
  'routing',
  'referral',
  'typewriterRu',
  'typewriterEn',
  'lkRu',
  'lkEn',
];

const Page = () => {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();

  const [form, setForm] = useState<FormState>({
    imageCost: 15,
    videoCost: 40,
    videoPricePerSecond: 8,
    photoEffectCost: 15,
    videoEffectCost: 40,
    aiCost1K: 15,
    aiCost2K: 20,
    systemPrompt: '',
    referralRewardTokens: 50,
    nanoBananaSystemPrompt: '',
    fluxSystemPrompt: '',
    trialTokens: 50,
    trialPeriodDays: 7,
    subscriptionGracePeriodDays: 3,

    titlesEn: {
      guest: [] as string[],
      noModel: [] as string[],
      hasModel: [] as string[],
    },

    titlesRu: {
      guest: [] as string[],
      noModel: [] as string[],
      hasModel: [] as string[],
    },
    lkTextsEn: {
      exploreCommunityTitle: '',
      exploreCommunityDescription: '',
      payTitle: '',
      payDescription: '',
      payAmountLabel: '',
      payButtonLabel: '',
      payCreateNewButton: '',
      profileTitle: '',
      profileDescription: '',
    },
    lkTextsRu: {
      exploreCommunityTitle: '',
      exploreCommunityDescription: '',
      payTitle: '',
      payDescription: '',
      payAmountLabel: '',
      payButtonLabel: '',
      payCreateNewButton: '',
      profileTitle: '',
      profileDescription: '',
    },
    effectRouting: defaultRouting,
  });

  useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setForm({
          imageCost: settings.imageCost,
          videoCost: settings.videoCost,
          videoPricePerSecond: settings.videoPricePerSecond ?? 8,
          photoEffectCost: settings.photoEffectCost ?? 15,
          videoEffectCost: settings.videoEffectCost ?? 40,
          aiCost1K: settings.aiCost1K,
          aiCost2K: settings.aiCost2K,
          systemPrompt: settings.systemPrompt,
          referralRewardTokens: (settings as any).referralRewardTokens ?? 50,
          nanoBananaSystemPrompt: settings.nanoBananaSystemPrompt || '',
          fluxSystemPrompt: settings.fluxSystemPrompt || '',
          trialTokens: settings.trialTokens,
          trialPeriodDays: settings.trialPeriodDays,
          subscriptionGracePeriodDays: settings.subscriptionGracePeriodDays,
          effectRouting: settings.effectRouting || defaultRouting,

          titlesEn: settings.titlesEn || {
            guest: [],
            noModel: [],
            hasModel: [],
          },

          titlesRu: settings.titlesRu || {
            guest: [],
            noModel: [],
            hasModel: [],
          },
          lkTextsEn: settings.lkTextsEn || {
            exploreCommunityTitle: '',
            exploreCommunityDescription: '',
            payTitle: '',
            payDescription: '',
            payAmountLabel: '',
            payButtonLabel: '',
            payCreateNewButton: '',
            profileTitle: '',
            profileDescription: '',
          },
          lkTextsRu: settings.lkTextsRu || {
            exploreCommunityTitle: '',
            exploreCommunityDescription: '',
            payTitle: '',
            payDescription: '',
            payAmountLabel: '',
            payButtonLabel: '',
            payCreateNewButton: '',
            profileTitle: '',
            profileDescription: '',
          },
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  const states: StateKey[] = ['guest', 'noModel', 'hasModel'];
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      pricing: true,
      trial: true,
      prompts: true,
      referral: true,
      routing: false,
      typewriterRu: false,
      typewriterEn: false,
      lkRu: false,
      lkEn: false,
    },
  );

  const handleSave = () => {
    update.mutate(form as any);
  };

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllSections = () => {
    const shouldOpenAll = SECTION_KEYS.some((key) => !openSections[key]);
    setOpenSections(
      SECTION_KEYS.reduce(
        (acc, key) => {
          acc[key] = shouldOpenAll;
          return acc;
        },
        {} as Record<SectionKey, boolean>,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Системный промпт и стоимость генераций
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleAllSections}>
          {SECTION_KEYS.every((key) => openSections[key])
            ? 'Свернуть все'
            : 'Развернуть все'}
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('pricing')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Стоимость генераций
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.pricing ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.pricing ? (
            <div className="px-6 pb-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4 text-amber-400" />
                    Изображение (токенов)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.imageCost}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        imageCost: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Video className="h-4 w-4 text-violet-400" />
                    Видео (токенов)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.videoCost}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        videoCost: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4 text-emerald-400" />
                    Фотоэффект (токенов)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.photoEffectCost}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        photoEffectCost: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Video className="h-4 w-4 text-cyan-400" />
                    Видеоэффект (токенов)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.videoEffectCost}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        videoEffectCost: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Video className="h-4 w-4 text-sky-400" />
                    Видео: цена за 1 сек
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={form.videoPricePerSecond}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        videoPricePerSecond: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4 text-blue-400" />
                    AI 1K Cost
                  </label>
                  <input
                    type="number"
                    value={form.aiCost1K}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        aiCost1K: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4 text-red-400" />
                    AI 2K Cost
                  </label>
                  <input
                    type="number"
                    value={form.aiCost2K}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        aiCost2K: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {form.imageCost}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    за изображение
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-400">
                    {form.videoCost}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    за видео
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-400">
                    {form.videoPricePerSecond}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    за 1 сек видео
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {form.photoEffectCost}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    за фотоэффект
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {form.videoEffectCost}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    за видеоэффект
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {form.aiCost1K}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    за 1k фото
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {form.aiCost2K}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    за 2k фото
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('trial')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Подписки и триал
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.trial ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.trial ? (
            <div className="px-6 pb-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Пробные токены</label>
                  <input
                    type="number"
                    value={form.trialTokens}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        trialTokens: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Пробный период (дни)
                  </label>
                  <input
                    type="number"
                    value={form.trialPeriodDays}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        trialPeriodDays: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Льготный период (дни)
                  </label>
                  <input
                    type="number"
                    value={form.subscriptionGracePeriodDays}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        subscriptionGracePeriodDays: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {form.trialTokens}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Пробные токены
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-400">
                    {form.trialPeriodDays}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Пробный период
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {form.subscriptionGracePeriodDays}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Льготный период
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('referral')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Реферальная программа
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.referral ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.referral && (
            <div className="px-6 pb-6 space-y-5">
              <p className="text-xs text-muted-foreground">
                Количество токенов, начисляемых пригласившему пользователю за
                каждого успешно зарегистрированного реферала.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Награда за реферала (токенов)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.referralRewardTokens}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        referralRewardTokens: Number(e.target.value),
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-400">
                    {form.referralRewardTokens}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    токенов за приглашение
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('prompts')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Системные промпты
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.prompts ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.prompts ? (
            <div className="px-6 pb-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Отдельные базовые промпты для разных ИИ-моделей фото
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nano Banana: системный промпт
                </label>
                <textarea
                  value={form.nanoBananaSystemPrompt}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      nanoBananaSystemPrompt: e.target.value,
                    }))
                  }
                  rows={6}
                  placeholder="Base prompt for nano banana..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Flux: системный промпт
                </label>
                <textarea
                  value={form.fluxSystemPrompt}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      fluxSystemPrompt: e.target.value,
                    }))
                  }
                  rows={6}
                  placeholder="Base prompt for flux..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Nano: {form.nanoBananaSystemPrompt.length} символов | Flux:{' '}
                  {form.fluxSystemPrompt.length} символов
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('routing')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
              Приоритет моделей и фолбеков
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.routing ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.routing ? (
            <div className="px-6 pb-6 space-y-4">
              {(
                [
                  ['photo_effect', 'Фотоэффекты'],
                  ['video_effect', 'Видеоэффекты'],
                  ['live_photo_template', 'Живое фото'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="rounded-lg border p-4 space-y-2">
                  <div className="font-medium">{label}</div>
                  <textarea
                    rows={3}
                    value={(form.effectRouting?.[key]?.models || []).join('\n')}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        effectRouting: {
                          ...f.effectRouting,
                          [key]: { models: parseLines(e.target.value) },
                        },
                      }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Одна модель на строку, сверху вниз = приоритет"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('typewriterRu')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Typewriter (RU)
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.typewriterRu ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.typewriterRu ? (
            <div className="px-6 pb-6 space-y-4">
              {states.map((state) => (
                <div key={state} className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    {state} (каждая строка = новое сообщение)
                  </label>
                  <textarea
                    rows={3}
                    value={(form.titlesRu[state] || []).join('\n')}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        titlesRu: {
                          ...f.titlesRu,
                          [state]: e.target.value.split('\n'),
                        },
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('typewriterEn')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Typewriter (EN)
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.typewriterEn ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.typewriterEn ? (
            <div className="px-6 pb-6 space-y-4">
              {states.map((state) => (
                <div key={state} className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    {state} (each line = new message)
                  </label>
                  <textarea
                    rows={3}
                    value={(form.titlesEn[state] || []).join('\n')}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        titlesEn: {
                          ...f.titlesEn,
                          [state]: e.target.value.split('\n'),
                        },
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('lkRu')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Тексты ЛК (RU)
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.lkRu ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.lkRu ? (
            <div className="px-6 pb-6 space-y-4">
              {(
                [
                  ['exploreCommunityTitle', 'Лента: заголовок'],
                  ['exploreCommunityDescription', 'Лента: описание'],
                  ['payTitle', 'Оплата: заголовок'],
                  ['payDescription', 'Оплата: описание'],
                  ['payAmountLabel', 'Оплата: подпись суммы'],
                  ['payButtonLabel', 'Оплата: кнопка оплатить'],
                  ['payCreateNewButton', 'Оплата: кнопка нового платежа'],
                  ['profileTitle', 'Профиль: заголовок'],
                  ['profileDescription', 'Профиль: описание'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    {label}
                  </label>
                  <input
                    value={form.lkTextsRu[key] || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lkTextsRu: { ...f.lkTextsRu, [key]: e.target.value },
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card w-full">
          <button
            type="button"
            onClick={() => toggleSection('lkEn')}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Тексты ЛК (EN)
            </h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSections.lkEn ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.lkEn ? (
            <div className="px-6 pb-6 space-y-4">
              {(
                [
                  ['exploreCommunityTitle', 'Feed: title'],
                  ['exploreCommunityDescription', 'Feed: description'],
                  ['payTitle', 'Pay: title'],
                  ['payDescription', 'Pay: description'],
                  ['payAmountLabel', 'Pay: amount label'],
                  ['payButtonLabel', 'Pay: pay button'],
                  ['payCreateNewButton', 'Pay: create new payment button'],
                  ['profileTitle', 'Profile: title'],
                  ['profileDescription', 'Profile: description'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    {label}
                  </label>
                  <input
                    value={form.lkTextsEn[key] || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lkTextsEn: { ...f.lkTextsEn, [key]: e.target.value },
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={update.isPending}
        variant="secondary"
        className="cursor-pointer w-full"
      >
        {update.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Сохранить настройки
      </Button>
    </div>
  );
};

export default Page;
