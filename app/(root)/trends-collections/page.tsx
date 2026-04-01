'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateEffectTemplate,
  useCreateTrend,
  useDeleteEffectTemplate,
  useDeleteTrend,
  useEffectTemplates,
  useSettings,
  useTrends,
  useUpdateEffectTemplate,
  useUpdateTrend,
  type AdminEffectTemplate,
  type AdminEffectTemplateType,
} from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageHandler } from '@/components/shared/ImageHandler';

type ViewFilter =
  | 'trends'
  | 'effects_all'
  | AdminEffectTemplateType
  | 'collections_photo'
  | 'collections_video';

type AddType =
  | 'trend'
  | 'photo_effect'
  | 'photo_edit_template'
  | 'video_effect'
  | 'live_photo_template';

type TrendFormState = {
  content: string;
  coverText: string;
  gender: 'male' | 'female' | 'both';
  isHot: boolean;
};

type EffectFormState = {
  name: string;
  description: string;
  type: AdminEffectTemplateType;
  model: string;
  defaultPrompt: string;
  isActive: boolean;
};

const MODEL_OPTIONS: Record<AdminEffectTemplateType, string[]> = {
  photo_effect: ['nano-banana-2', 'nano-banana-pro'],
  video_effect: ['higgsfield-video', 'kling', 'minimax-hailuo', 'grok-video'],
  live_photo_template: [
    'higgsfield-video',
    'kling',
    'minimax-hailuo',
    'grok-video',
  ],
};

const MODEL_PROVIDER_MAP: Record<string, string> = {
  'nano-banana-2': 'nano',
  'nano-banana-pro': 'nano-pro',
  'higgsfield-video': 'higgsfield',
  kling: 'kling',
  'minimax-hailuo': 'hailuo/minimax-2.3',
  'grok-video': 'grok-video',
};

const typeLabel: Record<AdminEffectTemplateType, string> = {
  photo_effect: 'Фотоэффекты',
  video_effect: 'Видеоэффекты',
  live_photo_template: 'Шаблоны оживления',
};

const emptyTrendForm: TrendFormState = {
  content: '',
  coverText: '',
  gender: 'both',
  isHot: false,
};

const emptyEffectForm = (type: AdminEffectTemplateType): EffectFormState => ({
  name: '',
  description: '',
  type,
  model: MODEL_OPTIONS[type][0],
  defaultPrompt: '',
  isActive: true,
});

const detectModel = (item: AdminEffectTemplate): string => {
  const raw = item.modelParams?.model;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return item.type === 'photo_effect' ? 'nano-banana-2' : 'kling';
};

const mapAddTypeToEffectType = (v: AddType): AdminEffectTemplateType => {
  if (v === 'video_effect') return 'video_effect';
  if (v === 'live_photo_template') return 'live_photo_template';
  return 'photo_effect';
};

export default function Page() {
  const [view, setView] = useState<ViewFilter>('trends');
  const [addType, setAddType] = useState<AddType>('trend');
  const [trendDialogOpen, setTrendDialogOpen] = useState(false);
  const [effectDialogOpen, setEffectDialogOpen] = useState(false);
  const [editingTrend, setEditingTrend] = useState<any | null>(null);
  const [editingEffect, setEditingEffect] =
    useState<AdminEffectTemplate | null>(null);

  const [trendForm, setTrendForm] = useState<TrendFormState>(emptyTrendForm);
  const [trendCover, setTrendCover] = useState<File | null>(null);
  const [trendImages, setTrendImages] = useState<File[]>([]);

  const [effectForm, setEffectForm] = useState<EffectFormState>(
    emptyEffectForm('photo_effect'),
  );

  const trendsQ = useTrends();
  const settingsQ = useSettings();
  const effectsType =
    view === 'photo_effect' ||
    view === 'video_effect' ||
    view === 'live_photo_template'
      ? view
      : view === 'effects_all'
        ? undefined
        : undefined;
  const effectsQ = useEffectTemplates(effectsType);

  const createTrend = useCreateTrend();
  const updateTrend = useUpdateTrend();
  const deleteTrend = useDeleteTrend();
  const createEffect = useCreateEffectTemplate();
  const updateEffect = useUpdateEffectTemplate();
  const deleteEffect = useDeleteEffectTemplate();

  const trendItems = useMemo(
    () => trendsQ.data?.pages.flatMap((p: any) => p.items || []) || [],
    [trendsQ.data],
  );

  const sortedEffects = useMemo(
    () =>
      [...(effectsQ.data || [])].sort(
        (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
      ),
    [effectsQ.data],
  );

  const openAdd = () => {
    if (addType === 'trend') {
      setEditingTrend(null);
      setTrendForm(emptyTrendForm);
      setTrendCover(null);
      setTrendImages([]);
      setTrendDialogOpen(true);
      return;
    }
    const type = mapAddTypeToEffectType(addType);
    setEditingEffect(null);
    setEffectForm(emptyEffectForm(type));
    setEffectDialogOpen(true);
  };

  const openEditTrend = (item: any) => {
    setEditingTrend(item);
    setTrendForm({
      content: item.content || '',
      coverText: item.coverText || '',
      gender: item.gender || 'both',
      isHot: !!item.isHot,
    });
    setTrendCover(null);
    setTrendImages([]);
    setTrendDialogOpen(true);
  };

  const openEditEffect = (item: AdminEffectTemplate) => {
    setEditingEffect(item);
    setEffectForm({
      name: item.name || '',
      description: item.description || '',
      type: item.type,
      model: detectModel(item),
      defaultPrompt: item.defaultPrompt || '',
      isActive: item.isActive,
    });
    setEffectDialogOpen(true);
  };

  const submitTrend = () => {
    if (!trendForm.content.trim()) {
      toast.error('Заполните контент тренда');
      return;
    }
    const fd = new FormData();
    fd.append('content', trendForm.content.trim());
    fd.append('coverText', trendForm.coverText.trim());
    fd.append('gender', trendForm.gender);
    fd.append('isHot', String(trendForm.isHot));
    if (trendCover) fd.append('trendingCover', trendCover);
    trendImages.forEach((f) => fd.append('trendingImageSet', f));

    if (editingTrend) {
      updateTrend.mutate(
        { id: editingTrend.id, data: fd },
        { onSuccess: () => setTrendDialogOpen(false) },
      );
    } else {
      createTrend.mutate(fd, { onSuccess: () => setTrendDialogOpen(false) });
    }
  };

  const submitEffect = () => {
    if (!effectForm.name.trim()) {
      toast.error('Заполните название');
      return;
    }
    const baseParams =
      editingEffect?.modelParams &&
      typeof editingEffect.modelParams === 'object'
        ? editingEffect.modelParams
        : {};
    const payload: Partial<AdminEffectTemplate> = {
      name: effectForm.name.trim(),
      description: effectForm.description.trim() || null,
      type: effectForm.type,
      provider:
        MODEL_PROVIDER_MAP[effectForm.model] || MODEL_PROVIDER_MAP.kling,
      defaultPrompt: effectForm.defaultPrompt.trim() || null,
      modelParams: { ...baseParams, model: effectForm.model },
      isActive: effectForm.isActive,
    };
    if (editingEffect) {
      updateEffect.mutate(
        { id: editingEffect.id, payload },
        { onSuccess: () => setEffectDialogOpen(false) },
      );
    } else {
      createEffect.mutate(payload, {
        onSuccess: () => setEffectDialogOpen(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Тренды / Коллекции
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Единый раздел управления трендами и коллекциями эффектов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={addType}
            onValueChange={(v) => setAddType(v as AddType)}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trend">
                Новый тренд для волшебного фото
              </SelectItem>
              <SelectItem value="photo_effect">Новый фотоэффект</SelectItem>
              <SelectItem value="photo_edit_template">
                Новые шаблоны для редактирования фото
              </SelectItem>
              <SelectItem value="video_effect">Новый видеоэффект</SelectItem>
              <SelectItem value="live_photo_template">
                Новые шаблоны для оживления
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={view} onValueChange={(v) => setView(v as ViewFilter)}>
          <SelectTrigger className="w-[320px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trends">Тренды волшебного фото</SelectItem>
            <SelectItem value="effects_all">Все эффекты</SelectItem>
            <SelectItem value="photo_effect">Фотоэффекты</SelectItem>
            <SelectItem value="video_effect">Видеоэффекты</SelectItem>
            <SelectItem value="live_photo_template">
              Шаблоны оживления
            </SelectItem>
            <SelectItem value="collections_photo">
              Коллекции фотоэффектов
            </SelectItem>
            <SelectItem value="collections_video">
              Коллекции видеоэффектов
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === 'trends' ? (
        <div className="rounded-xl border bg-card">
          {trendsQ.isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y">
              {trendItems.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.trendingCover ? (
                      <ImageHandler
                        src={item.trendingCover}
                        alt={item.coverText || item.content}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {item.coverText || 'Без заголовка'}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {item.content}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditTrend(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTrend.mutate(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {!trendItems.length && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Нет трендов
                </div>
              )}
            </div>
          )}
        </div>
      ) : view === 'collections_photo' || view === 'collections_video' ? (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          {(view === 'collections_photo'
            ? settingsQ.data?.photoEffectsCollections
            : settingsQ.data?.videoEffectsCollections
          )?.map((c) => (
            <div key={c.id} className="rounded-lg border p-3">
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Эффектов: {c.effectIds?.length || 0}
              </div>
            </div>
          ))}
          <div>
            <Button asChild variant="outline">
              <Link href="/settings">Редактировать коллекции в настройках</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          {effectsQ.isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y">
              {sortedEffects.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {typeLabel[item.type]} • {detectModel(item)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditEffect(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEffect.mutate(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {!sortedEffects.length && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Нет эффектов
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={trendDialogOpen} onOpenChange={setTrendDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTrend ? 'Редактировать тренд' : 'Новый тренд'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Заголовок на обложке</Label>
              <Input
                value={trendForm.coverText}
                onChange={(e) =>
                  setTrendForm((f) => ({ ...f, coverText: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Контент / промпт</Label>
              <Textarea
                rows={4}
                value={trendForm.content}
                onChange={(e) =>
                  setTrendForm((f) => ({ ...f, content: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Пол</Label>
                <Select
                  value={trendForm.gender}
                  onValueChange={(v) =>
                    setTrendForm((f) => ({
                      ...f,
                      gender: v as 'male' | 'female' | 'both',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Все</SelectItem>
                    <SelectItem value="female">Женские</SelectItem>
                    <SelectItem value="male">Мужские</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Топовый тренд</Label>
                <Select
                  value={trendForm.isHot ? 'yes' : 'no'}
                  onValueChange={(v) =>
                    setTrendForm((f) => ({ ...f, isHot: v === 'yes' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Да</SelectItem>
                    <SelectItem value="no">Нет</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Обложка</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTrendCover(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Изображения коллекции</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setTrendImages(Array.from(e.target.files || []))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrendDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={submitTrend}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={effectDialogOpen} onOpenChange={setEffectDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEffect ? 'Редактировать эффект' : 'Новый эффект'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Select
                  value={effectForm.type}
                  onValueChange={(v) => {
                    const type = v as AdminEffectTemplateType;
                    setEffectForm((f) => ({
                      ...f,
                      type,
                      model: MODEL_OPTIONS[type][0],
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo_effect">Фотоэффект</SelectItem>
                    <SelectItem value="video_effect">Видеоэффект</SelectItem>
                    <SelectItem value="live_photo_template">
                      Шаблон оживления
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Модель</Label>
                <Select
                  value={effectForm.model}
                  onValueChange={(v) =>
                    setEffectForm((f) => ({ ...f, model: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS[effectForm.type].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input
                value={effectForm.name}
                onChange={(e) =>
                  setEffectForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea
                rows={3}
                value={effectForm.description}
                onChange={(e) =>
                  setEffectForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Промпт по умолчанию</Label>
              <Textarea
                rows={3}
                value={effectForm.defaultPrompt}
                onChange={(e) =>
                  setEffectForm((f) => ({
                    ...f,
                    defaultPrompt: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEffectDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={submitEffect}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
