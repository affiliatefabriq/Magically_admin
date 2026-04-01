'use client';

import { useMemo, useState } from 'react';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  type AdminEffectTemplate,
  type AdminEffectTemplateType,
  useCreateEffectTemplate,
  useDeleteEffectTemplate,
  useEffectTemplates,
  useUploadEffectCover,
  useUpdateEffectTemplate,
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ImageHandler } from '@/components/shared/ImageHandler';

type FormState = {
  name: string;
  description: string;
  type: AdminEffectTemplateType;
  model: string;
  coverUrl: string;
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

const detectModel = (item: AdminEffectTemplate): string => {
  const raw = item.modelParams?.model;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (item.type === 'photo_effect') return 'nano-banana-2';
  return 'kling';
};

const isVideoUrl = (url: string) =>
  /\.(mp4|mov|webm|mkv)(\?.*)?$/i.test(url.split('?')[0]);

const emptyForm = (
  type: AdminEffectTemplateType,
  model?: string,
): FormState => ({
  name: '',
  description: '',
  type,
  model: model || MODEL_OPTIONS[type][0],
  coverUrl: '',
  defaultPrompt: '',
  isActive: true,
});

const typeLabel: Record<AdminEffectTemplateType, string> = {
  photo_effect: 'Фотоэффекты',
  video_effect: 'Видеоэффекты',
  live_photo_template: 'Живое фото',
};

const Page = () => {
  const [activeType, setActiveType] =
    useState<AdminEffectTemplateType>('photo_effect');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEffectTemplate | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(activeType));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data, isLoading } = useEffectTemplates(activeType);
  const createTemplate = useCreateEffectTemplate();
  const updateTemplate = useUpdateEffectTemplate();
  const deleteTemplate = useDeleteEffectTemplate();
  const uploadCover = useUploadEffectCover();

  const isPending =
    createTemplate.isPending ||
    updateTemplate.isPending ||
    deleteTemplate.isPending ||
    uploadCover.isPending;

  const sortedData = useMemo(
    () =>
      [...(data || [])].sort(
        (a, b) =>
          Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
          a.name.localeCompare(b.name),
      ),
    [data],
  );

  const moveTemplate = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const list = [...sortedData];
    const fromIndex = list.findIndex((x) => x.id === fromId);
    const toIndex = list.findIndex((x) => x.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    const updates = list.map((item, index) => ({
      id: item.id,
      sortOrder: index,
    }));
    for (const u of updates) {
      const original = sortedData.find((x) => x.id === u.id)?.sortOrder ?? 0;
      if (original === u.sortOrder) continue;
      await updateTemplate.mutateAsync({
        id: u.id,
        payload: { sortOrder: u.sortOrder },
      });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(activeType, MODEL_OPTIONS[activeType][0]));
    setDialogOpen(true);
  };

  const openEdit = (item: AdminEffectTemplate) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      type: item.type,
      model: detectModel(item),
      coverUrl: item.coverUrl || '',
      defaultPrompt: item.defaultPrompt || '',
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast.error('Заполните название');
      return;
    }

    const baseParams =
      editing?.modelParams && typeof editing.modelParams === 'object'
        ? editing.modelParams
        : {};

    const payload: Partial<AdminEffectTemplate> = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      provider: MODEL_PROVIDER_MAP[form.model] || MODEL_PROVIDER_MAP.kling,
      coverUrl: form.coverUrl.trim() || null,
      defaultPrompt: form.defaultPrompt.trim() || null,
      modelParams: { ...baseParams, model: form.model },
      isActive: form.isActive,
    };

    if (editing) {
      updateTemplate.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
      return;
    }

    createTemplate.mutate(payload, { onSuccess: () => setDialogOpen(false) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Эффекты</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управление шаблонами для фотоэффектов, видеоэффектов и живого фото
          </p>
        </div>
        <Button onClick={openCreate} disabled={isPending}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить шаблон
        </Button>
      </div>

      <div className="flex gap-2">
        {(Object.keys(typeLabel) as AdminEffectTemplateType[]).map((type) => (
          <Button
            key={type}
            variant={activeType === type ? 'default' : 'outline'}
            onClick={() => setActiveType(type)}
          >
            {typeLabel[type]}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="grid grid-cols-[2fr_1fr_1fr] px-4 py-3 text-xs uppercase text-muted-foreground border-b">
          <div>Название</div>
          <div>Модель</div>
          <div className="text-right">Действия</div>
        </div>
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !sortedData.length ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Нет шаблонов
          </div>
        ) : (
          sortedData.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[2fr_1fr_1fr] items-center px-4 py-3 border-b last:border-b-0"
              draggable
              onDragStart={() => setDraggingId(item.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                if (!draggingId) return;
                await moveTemplate(draggingId, item.id);
                setDraggingId(null);
              }}
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {item.description || '—'}
                </div>
              </div>
              <div className="text-sm">{detectModel(item)}</div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(item)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTemplate.mutate(item.id)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Редактировать шаблон' : 'Создать шаблон'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Название</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Модель</Label>
                <Select
                  value={form.model}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, model: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS[form.type].map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Превью</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  type="file"
                  accept={
                    form.type === 'video_effect' ||
                    form.type === 'live_photo_template'
                      ? 'image/*,video/*'
                      : 'image/*'
                  }
                  className="max-w-sm"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadCover.mutateAsync(file);
                    if (url) {
                      setForm((f) => ({ ...f, coverUrl: url }));
                      toast.success('Обложка загружена');
                    }
                  }}
                />
                {uploadCover.isPending ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : null}
              </div>
              {form.coverUrl ? (
                <div className="rounded-lg border overflow-hidden w-40 h-40">
                  {isVideoUrl(form.coverUrl) ? (
                    <video
                      src={form.coverUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <ImageHandler
                      src={form.coverUrl}
                      alt="cover"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: AdminEffectTemplateType) =>
                    setForm((f) => ({
                      ...f,
                      type: value,
                      model: MODEL_OPTIONS[value][0],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo_effect">Фотоэффект</SelectItem>
                    <SelectItem value="video_effect">Видеоэффект</SelectItem>
                    <SelectItem value="live_photo_template">
                      Живое фото
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Промпт по умолчанию</Label>
              <Textarea
                rows={3}
                value={form.defaultPrompt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, defaultPrompt: e.target.value }))
                }
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Активен
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
