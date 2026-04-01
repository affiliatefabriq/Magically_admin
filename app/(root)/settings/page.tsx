'use client';

import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useAdmin';
import { Loader2, Save, ImageIcon, Video, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StateKey = 'guest' | 'noModel' | 'hasModel';

type FormState = {
  imageCost: number;
  videoCost: number;
  aiCost1K: number;
  aiCost2K: number;
  systemPrompt: string;
  trialTokens: number;
  trialPeriodDays: number;
  subscriptionGracePeriodDays: number;
  titlesEn: Record<StateKey, string[]>;
  titlesRu: Record<StateKey, string[]>;
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

const Page = () => {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();

  const [form, setForm] = useState<FormState>({
    imageCost: 15,
    videoCost: 40,
    aiCost1K: 15,
    aiCost2K: 20,
    systemPrompt: '',
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
    effectRouting: defaultRouting,
  });

  useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setForm({
          imageCost: settings.imageCost,
          videoCost: settings.videoCost,
          aiCost1K: settings.aiCost1K,
          aiCost2K: settings.aiCost2K,
          systemPrompt: settings.systemPrompt,
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
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  const states: StateKey[] = ['guest', 'noModel', 'hasModel'];

  const handleSave = () => {
    update.mutate(form as any);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Системный промпт и стоимость генераций
        </p>
      </div>
      {/* Container */}
      <div className="flex flex-col items-center justify-center gap-2 w-full">
        {/* Pricing */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5 w-full">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Стоимость генераций
          </h2>

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
                  setForm((f) => ({ ...f, imageCost: Number(e.target.value) }))
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
                  setForm((f) => ({ ...f, videoCost: Number(e.target.value) }))
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
                  setForm((f) => ({ ...f, aiCost1K: Number(e.target.value) }))
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
                  setForm((f) => ({ ...f, aiCost2K: Number(e.target.value) }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Preview */}
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

        <div className="rounded-xl border border-border bg-card p-6 space-y-5 w-full">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Подписки и Триал</h3>
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

        {/* System Prompt */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 w-full">
          <div>
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Системный промпт
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Базовый промпт, который добавляется к каждой генерации изображений
            </p>
          </div>

          <textarea
            value={form.systemPrompt}
            onChange={(e) =>
              setForm((f) => ({ ...f, systemPrompt: e.target.value }))
            }
            rows={10}
            placeholder="Photorealistic, high quality, 8k resolution..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{form.systemPrompt.length} символов</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 w-full">
        <h2 className="font-medium text-sm uppercase tracking-wider">
          Приоритет моделей и фолбеков
        </h2>
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

      <div className="rounded-xl border p-6 space-y-4 w-full bg-card">
        <h2 className="text-sm font-medium">Typewriter (RU)</h2>

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

      <div className="rounded-xl border p-6 space-y-4 w-full bg-card">
        <h2 className="text-sm font-medium">Typewriter (EN)</h2>

        {states.map((state) => (
          <div key={state} className="space-y-2">
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

      {/* Save */}
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
