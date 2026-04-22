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
import { EffectTemplateDialogForm } from '@/components/effect-template/EffectTemplateDialogForm';
import {
  defaultModelForType,
  providerForModel,
  resolveModelForType,
  templateModelToSelectValue,
} from '@/lib/effectTemplateModels';

type FormState = {
  name: string;
  description: string;
  type: AdminEffectTemplateType;
  model: string;
  coverUrl: string;
  defaultPrompt: string;
  costTokens: string;
  trendContent: string;
  trendCoverText: string;
  trendGender: 'male' | 'female' | 'both';
  trendIsHot: boolean;
  publishToTrends: boolean;
  trendImageSetUrls: string[];
  isActive: boolean;
};

const emptyForm = (
  type: AdminEffectTemplateType,
  model?: string,
): FormState => ({
  name: '',
  description: '',
  type,
  model: model || defaultModelForType(type),
  coverUrl: '',
  defaultPrompt: '',
  costTokens: '',
  trendContent: '',
  trendCoverText: '',
  trendGender: 'both',
  trendIsHot: false,
  publishToTrends: false,
  trendImageSetUrls: [],
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
    setForm(emptyForm(activeType, defaultModelForType(activeType)));
    setDialogOpen(true);
  };

  const openEdit = (item: AdminEffectTemplate) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      type: item.type,
      model: templateModelToSelectValue(item.type, item.modelParams),
      coverUrl: item.coverUrl || '',
      defaultPrompt: item.defaultPrompt || '',
      costTokens:
        item.costTokens != null && item.costTokens >= 0
          ? String(item.costTokens)
          : '',
      trendContent: item.trendContent || '',
      trendCoverText: item.trendCoverText || '',
      trendGender: item.trendGender || 'both',
      trendIsHot: Boolean(item.trendIsHot),
      publishToTrends: Boolean(item.publishToTrends),
      trendImageSetUrls: (item.trendImageSetUrls || []).slice(0, 2),
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

    const ct = form.costTokens.trim();
    const costTokensNum = ct === '' ? null : Number(ct);
    const costTokens =
      costTokensNum != null &&
      Number.isFinite(costTokensNum) &&
      costTokensNum >= 0
        ? costTokensNum
        : null;

    const payload: Partial<AdminEffectTemplate> = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      provider: providerForModel(form.model, form.type),
      coverUrl: form.coverUrl.trim() || null,
      defaultPrompt: form.defaultPrompt.trim() || null,
      costTokens,
      publishToTrends: form.publishToTrends,
      trendContent: form.trendContent.trim() || undefined,
      trendCoverText: form.trendCoverText.trim() || undefined,
      trendGender: form.trendGender,
      trendIsHot: form.trendIsHot,
      trendImageSetUrls: form.trendImageSetUrls.slice(0, 2),
      modelParams: {
        ...baseParams,
        model: resolveModelForType(form.type, form.model),
      },
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
              <div className="text-sm">
                {templateModelToSelectValue(item.type, item.modelParams)}
              </div>
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
          <EffectTemplateDialogForm
            type={form.type}
            onTypeChange={(next) =>
              setForm((f) => ({
                ...f,
                type: next,
                model: resolveModelForType(next, f.model),
              }))
            }
            name={form.name}
            onNameChange={(v) => setForm((f) => ({ ...f, name: v }))}
            description={form.description}
            onDescriptionChange={(v) =>
              setForm((f) => ({ ...f, description: v }))
            }
            model={form.model}
            onModelChange={(v) => setForm((f) => ({ ...f, model: v }))}
            costTokens={form.costTokens}
            onCostTokensChange={(v) => setForm((f) => ({ ...f, costTokens: v }))}
            defaultPrompt={form.defaultPrompt}
            onDefaultPromptChange={(v) =>
              setForm((f) => ({ ...f, defaultPrompt: v }))
            }
            coverPreviewUrl=""
            coverStoredUrl={form.coverUrl}
            coverAccept={
              form.type === 'video_effect' ||
              form.type === 'live_photo_template'
                ? 'image/*,video/*'
                : 'image/*'
            }
            onCoverFile={async (file) => {
              if (!file) return;
              const url = await uploadCover.mutateAsync(file);
              if (url) {
                setForm((f) => ({ ...f, coverUrl: url }));
                toast.success('Обложка загружена');
              }
            }}
            squareUrls={form.trendImageSetUrls}
            onRemoveSquare={(idx) =>
              setForm((f) => ({
                ...f,
                trendImageSetUrls: f.trendImageSetUrls.filter((_, i) => i !== idx),
              }))
            }
            onPickSquareFiles={async (files) => {
              if (!files.length) return;
              const uploaded: string[] = [];
              for (const file of files) {
                const url = await uploadCover.mutateAsync(file);
                if (url) uploaded.push(url);
              }
              if (uploaded.length) {
                setForm((f) => ({
                  ...f,
                  trendImageSetUrls: [...f.trendImageSetUrls, ...uploaded].slice(
                    0,
                    2,
                  ),
                }));
                toast.success('Изображения добавлены');
              }
            }}
            isUploadingCover={uploadCover.isPending}
            isUploadingSquare={uploadCover.isPending}
            isActive={form.isActive}
            onIsActiveChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            squareSectionTitle="Фото внизу тренда (до 2)"
            footerExtra={
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Пол для тренда</Label>
                    <Select
                      value={form.trendGender}
                      onValueChange={(value: 'male' | 'female' | 'both') =>
                        setForm((f) => ({ ...f, trendGender: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Мужской</SelectItem>
                        <SelectItem value="female">Женский</SelectItem>
                        <SelectItem value="both">Оба</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Топовый тренд</Label>
                    <Select
                      value={form.trendIsHot ? 'yes' : 'no'}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, trendIsHot: v === 'yes' }))
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
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.publishToTrends}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        publishToTrends: e.target.checked,
                      }))
                    }
                  />
                  Добавить в тренды на главную
                </label>
                <div className="space-y-1.5">
                  <Label>Промпт тренда</Label>
                  <Textarea
                    rows={3}
                    value={form.trendContent}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, trendContent: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Текст на обложке тренда</Label>
                  <Input
                    value={form.trendCoverText}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, trendCoverText: e.target.value }))
                    }
                  />
                </div>
              </div>
            }
          />
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
