'use client';

import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useAdmin';
import { Loader2, Save, ImageIcon, Video, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Page = () => {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();

  const [form, setForm] = useState({
    imageCost: 15,
    videoCost: 40,
    systemPrompt: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        imageCost: settings.imageCost,
        videoCost: settings.videoCost,
        systemPrompt: settings.systemPrompt,
      });
    }
  }, [settings]);

  const handleSave = () => {
    update.mutate(form);
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
