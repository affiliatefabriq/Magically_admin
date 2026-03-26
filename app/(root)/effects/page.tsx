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

type FormState = {
  name: string;
  description: string;
  type: AdminEffectTemplateType;
  provider: string;
  defaultPrompt: string;
  costTokens: string;
  sortOrder: string;
  isActive: boolean;
  modelParams: string;
};

const emptyForm = (type: AdminEffectTemplateType): FormState => ({
  name: '',
  description: '',
  type,
  provider: '',
  defaultPrompt: '',
  costTokens: '',
  sortOrder: '0',
  isActive: true,
  modelParams: '{}',
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

  const { data, isLoading } = useEffectTemplates(activeType);
  const createTemplate = useCreateEffectTemplate();
  const updateTemplate = useUpdateEffectTemplate();
  const deleteTemplate = useDeleteEffectTemplate();

  const isPending =
    createTemplate.isPending || updateTemplate.isPending || deleteTemplate.isPending;

  const sortedData = useMemo(
    () =>
      [...(data || [])].sort(
        (a, b) =>
          Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
          a.name.localeCompare(b.name),
      ),
    [data],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(activeType));
    setDialogOpen(true);
  };

  const openEdit = (item: AdminEffectTemplate) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      type: item.type,
      provider: item.provider || '',
      defaultPrompt: item.defaultPrompt || '',
      costTokens:
        typeof item.costTokens === 'number' ? String(item.costTokens) : '',
      sortOrder: String(item.sortOrder ?? 0),
      isActive: item.isActive,
      modelParams: JSON.stringify(item.modelParams || {}, null, 2),
    });
    setDialogOpen(true);
  };

  const submit = () => {
    let parsedModelParams: Record<string, unknown> | null = null;
    try {
      const value = form.modelParams.trim();
      parsedModelParams = value ? (JSON.parse(value) as Record<string, unknown>) : null;
    } catch {
      toast.error('Model Params должен быть валидным JSON');
      return;
    }

    const payload: Partial<AdminEffectTemplate> = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      provider: form.provider.trim(),
      defaultPrompt: form.defaultPrompt.trim() || null,
      modelParams: parsedModelParams,
      costTokens: form.costTokens.trim() ? Number(form.costTokens) : null,
      sortOrder: Number(form.sortOrder) || 0,
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
        <div className="grid grid-cols-[1.8fr_1fr_.8fr_.8fr_1fr] px-4 py-3 text-xs uppercase text-muted-foreground border-b">
          <div>Название</div>
          <div>Провайдер</div>
          <div>Токены</div>
          <div>Порядок</div>
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
              className="grid grid-cols-[1.8fr_1fr_.8fr_.8fr_1fr] items-center px-4 py-3 border-b last:border-b-0"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {item.description || '—'}
                </div>
              </div>
              <div className="text-sm">{item.provider}</div>
              <div className="text-sm">{item.costTokens ?? '—'}</div>
              <div className="text-sm">{item.sortOrder ?? 0}</div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
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
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Провайдер</Label>
                <Input
                  value={form.provider}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, provider: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: AdminEffectTemplateType) =>
                    setForm((f) => ({ ...f, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo_effect">Фотоэффект</SelectItem>
                    <SelectItem value="video_effect">Видеоэффект</SelectItem>
                    <SelectItem value="live_photo_template">Живое фото</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Токены</Label>
                <Input
                  type="number"
                  value={form.costTokens}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, costTokens: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Порядок</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: e.target.value }))
                  }
                />
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

            <div className="space-y-1.5">
              <Label>Model Params (JSON)</Label>
              <Textarea
                rows={8}
                value={form.modelParams}
                onChange={(e) =>
                  setForm((f) => ({ ...f, modelParams: e.target.value }))
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
