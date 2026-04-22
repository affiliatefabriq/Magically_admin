'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateEffectTemplate,
  useCreateTrend,
  useDeleteEffectTemplate,
  useDeleteTrend,
  useEffectTemplates,
  useUploadEffectCover,
  useSettings,
  useTrends,
  useUpdateEffectTemplate,
  useUpdateSettings,
  useUpdateTrend,
  type AdminEffectTemplate,
  type AdminEffectTemplateType,
  type EffectCollection,
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
import { EffectTemplateDialogForm } from '@/components/effect-template/EffectTemplateDialogForm';
import {
  defaultModelForType,
  providerForModel,
  resolveModelForType,
  templateModelToSelectValue,
} from '@/lib/effectTemplateModels';
import {
  PHOTO_COLLECTION_PLACEMENT_OPTIONS,
  VIDEO_COLLECTION_PLACEMENT_OPTIONS,
} from '@/lib/effectCollectionDisplayTargets';
import {
  collectionOptionKeys,
  getCollectionOptionFieldUi,
} from '@/lib/collectionOptionFields';

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
  | 'live_photo_template'
  | 'collection_photo'
  | 'collection_video';

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
  exampleImageSet: string[];
  costTokens: string;
  isActive: boolean;
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
  model: defaultModelForType(type),
  defaultPrompt: '',
  exampleImageSet: [],
  costTokens: '',
  isActive: true,
});

const mapAddTypeToEffectType = (v: AddType): AdminEffectTemplateType => {
  if (v === 'video_effect') return 'video_effect';
  if (v === 'live_photo_template') return 'live_photo_template';
  return 'photo_effect';
};

const isVideoUrl = (url: string) =>
  /\.(mp4|mov|webm|mkv)(\?.*)?$/i.test(url.split('?')[0]);

const parseLines = (value: string) =>
  value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);

const emptyCollection = (): EffectCollection => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  coverUrl: '',
  effectIds: [],
  sortOrder: 0,
  isActive: true,
  displayTargets: [],
  gender: 'both',
  isHot: false,
  options: {},
});

export default function Page() {
  const [view, setView] = useState<ViewFilter>('trends');
  const [addType, setAddType] = useState<AddType>('trend');
  const [trendDialogOpen, setTrendDialogOpen] = useState(false);
  const [effectDialogOpen, setEffectDialogOpen] = useState(false);
  const [editingTrend, setEditingTrend] = useState<any | null>(null);
  const [editingEffect, setEditingEffect] =
    useState<AdminEffectTemplate | null>(null);
  const [draggingEffectId, setDraggingEffectId] = useState<string | null>(null);

  const [trendForm, setTrendForm] = useState<TrendFormState>(emptyTrendForm);
  const [trendCover, setTrendCover] = useState<File | null>(null);
  const [trendImages, setTrendImages] = useState<File[]>([]);
  const [trendInitialImages, setTrendInitialImages] = useState<string[]>([]);
  const [trendExistingImages, setTrendExistingImages] = useState<string[]>([]);

  const [effectForm, setEffectForm] = useState<EffectFormState>(
    emptyEffectForm('photo_effect'),
  );
  const [effectCoverFile, setEffectCoverFile] = useState<File | null>(null);
  const [effectCoverUrl, setEffectCoverUrl] = useState('');

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
  const uploadEffectCover = useUploadEffectCover();
  const updateSettings = useUpdateSettings();

  const [collectionsDraft, setCollectionsDraft] = useState<EffectCollection[]>(
    [],
  );
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null,
  );
  const [collectionModalKind, setCollectionModalKind] = useState<
    'photo' | 'video'
  >('photo');
  const [collectionForm, setCollectionForm] = useState<EffectCollection>(
    emptyCollection(),
  );

  const trendItems = useMemo(
    () =>
      trendsQ.data?.pages.flatMap(
        (p: any) => p.trends || p.items || p.data?.trends || [],
      ) || [],
    [trendsQ.data],
  );

  const sortedEffects = useMemo(
    () =>
      [...(effectsQ.data || [])].sort(
        (a, b) =>
          Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
          a.name.localeCompare(b.name),
      ),
    [effectsQ.data],
  );

  const effectCoverPreviewUrl = useMemo(
    () => (effectCoverFile ? URL.createObjectURL(effectCoverFile) : ''),
    [effectCoverFile],
  );

  const moveEffect = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const list = [...sortedEffects];
    const fromIndex = list.findIndex((x) => x.id === fromId);
    const toIndex = list.findIndex((x) => x.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    const updates = list.map((item, index) => ({
      id: item.id,
      sortOrder: index,
    }));
    for (const update of updates) {
      const original =
        sortedEffects.find((x) => x.id === update.id)?.sortOrder ?? 0;
      if (original === update.sortOrder) continue;
      await updateEffect.mutateAsync({
        id: update.id,
        payload: { sortOrder: update.sortOrder },
      });
    }
  };

  useEffect(() => {
    if (!effectCoverPreviewUrl) return;
    return () => URL.revokeObjectURL(effectCoverPreviewUrl);
  }, [effectCoverPreviewUrl]);

  useEffect(() => {
    if (!settingsQ.data) return;
    const timer = setTimeout(() => {
      if (view === 'collections_photo') {
        setCollectionsDraft(
          JSON.parse(
            JSON.stringify(settingsQ.data.photoEffectsCollections || []),
          ) as EffectCollection[],
        );
      } else if (view === 'collections_video') {
        setCollectionsDraft(
          JSON.parse(
            JSON.stringify(settingsQ.data.videoEffectsCollections || []),
          ) as EffectCollection[],
        );
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [view, settingsQ.data]);

  const handleUploadCollectionCoverInModal = async (file: File | null) => {
    if (!file) return;
    const url = await uploadEffectCover.mutateAsync(file);
    if (!url) return;
    setCollectionForm((c) => ({ ...c, coverUrl: url }));
  };

  const collectionDisplayTargetOptions =
    collectionModalKind === 'photo'
      ? [...PHOTO_COLLECTION_PLACEMENT_OPTIONS]
      : [...VIDEO_COLLECTION_PLACEMENT_OPTIONS];

  const collectionCoverAccept =
    collectionModalKind === 'photo' ? 'image/*' : 'image/*,video/*';

  const sortedCollectionsDraft = useMemo(
    () =>
      [...collectionsDraft].sort(
        (a, b) =>
          Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
          (a.title || '').localeCompare(b.title || ''),
      ),
    [collectionsDraft],
  );

  const openNewCollectionModal = (kind?: 'photo' | 'video') => {
    const k =
      kind ?? (view === 'collections_video' ? 'video' : 'photo');
    setCollectionModalKind(k);
    setEditingCollectionId(null);
    setCollectionForm(emptyCollection());
    setCollectionDialogOpen(true);
  };

  const openEditCollectionModal = (item: EffectCollection) => {
    setCollectionModalKind(
      view === 'collections_video' ? 'video' : 'photo',
    );
    setEditingCollectionId(item.id);
    setCollectionForm(
      JSON.parse(JSON.stringify(item)) as EffectCollection,
    );
    setCollectionDialogOpen(true);
  };

  const submitCollectionModal = () => {
    if (!collectionForm.title.trim()) {
      toast.error('Укажите название коллекции');
      return;
    }
    setCollectionsDraft((prev) => {
      if (editingCollectionId === null) {
        const next = [...prev, { ...collectionForm, sortOrder: prev.length }];
        return next;
      }
      const idx = prev.findIndex((x) => x.id === editingCollectionId);
      if (idx < 0) {
        return [...prev, { ...collectionForm, sortOrder: prev.length }];
      }
      return prev.map((x, i) =>
        i === idx ? { ...collectionForm } : x,
      );
    });
    setCollectionDialogOpen(false);
    setEditingCollectionId(null);
  };

  const removeCollectionById = (id: string) => {
    setCollectionsDraft((prev) => prev.filter((c) => c.id !== id));
  };

  const saveCollections = () => {
    if (view === 'collections_photo') {
      updateSettings.mutate({ photoEffectsCollections: collectionsDraft });
    } else if (view === 'collections_video') {
      updateSettings.mutate({ videoEffectsCollections: collectionsDraft });
    }
  };

  const openAdd = () => {
    if (addType === 'trend') {
      setEditingTrend(null);
      setTrendForm(emptyTrendForm);
      setTrendCover(null);
      setTrendImages([]);
      setTrendInitialImages([]);
      setTrendExistingImages([]);
      setTrendDialogOpen(true);
      return;
    }
    if (addType === 'collection_photo') {
      setView('collections_photo');
      openNewCollectionModal('photo');
      return;
    }
    if (addType === 'collection_video') {
      setView('collections_video');
      openNewCollectionModal('video');
      return;
    }
    const type = mapAddTypeToEffectType(addType);
    setEditingEffect(null);
    setEffectForm(emptyEffectForm(type));
    setEffectCoverFile(null);
    setEffectCoverUrl('');
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
    const existing = Array.isArray(item.trendingImageSet)
      ? item.trendingImageSet
      : [];
    setTrendInitialImages(existing);
    setTrendExistingImages(existing);
    setTrendDialogOpen(true);
  };

  const openEditEffect = (item: AdminEffectTemplate) => {
    setEditingEffect(item);
    setEffectForm({
      name: item.name || '',
      description: item.description || '',
      type: item.type,
      model: templateModelToSelectValue(item.type, item.modelParams),
      defaultPrompt: item.defaultPrompt || '',
      exampleImageSet: (
        Array.isArray(item.exampleImageSet) ? item.exampleImageSet : []
      ).slice(0, 2),
      costTokens:
        item.costTokens != null && item.costTokens >= 0
          ? String(item.costTokens)
          : '',
      isActive: item.isActive,
    });
    setEffectCoverFile(null);
    setEffectCoverUrl(item.coverUrl || '');
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
    const maxNew = Math.max(0, 2 - trendExistingImages.length);
    trendImages.slice(0, maxNew).forEach((f) => fd.append('trendingImageSet', f));
    if (editingTrend) {
      const removed = trendInitialImages.filter(
        (url) => !trendExistingImages.includes(url),
      );
      removed.forEach((url) => fd.append('removeImages', url));
    }

    if (editingTrend) {
      updateTrend.mutate(
        { id: editingTrend.id, data: fd },
        { onSuccess: () => setTrendDialogOpen(false) },
      );
    } else {
      createTrend.mutate(fd, { onSuccess: () => setTrendDialogOpen(false) });
    }
  };

  const submitEffect = async () => {
    if (!effectForm.name.trim()) {
      toast.error('Заполните название');
      return;
    }
    try {
      const baseParams =
        editingEffect?.modelParams &&
        typeof editingEffect.modelParams === 'object'
          ? editingEffect.modelParams
          : {};
      let coverUrl = effectCoverUrl.trim() || null;
      if (effectCoverFile) {
        const uploaded = await uploadEffectCover.mutateAsync(effectCoverFile);
        coverUrl = uploaded || null;
      }

      const ct = effectForm.costTokens.trim();
      const costTokensNum = ct === '' ? null : Number(ct);
      const costTokens =
        costTokensNum != null &&
        Number.isFinite(costTokensNum) &&
        costTokensNum >= 0
          ? costTokensNum
          : null;
      const payload: Partial<AdminEffectTemplate> = {
        name: effectForm.name.trim(),
        description: effectForm.description.trim() || null,
        type: effectForm.type,
        provider: providerForModel(effectForm.model, effectForm.type),
        coverUrl,
        exampleImageSet: effectForm.exampleImageSet.slice(0, 2),
        defaultPrompt: effectForm.defaultPrompt.trim() || null,
        modelParams: {
          ...baseParams,
          model: resolveModelForType(effectForm.type, effectForm.model),
        },
        costTokens,
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
    } catch {
      return;
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
            <SelectTrigger className="w-[min(100%,380px)] max-w-[380px]">
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
              <SelectItem value="collection_photo">
                Новая коллекция фотоэффектов
              </SelectItem>
              <SelectItem value="collection_video">
                Новая коллекция видеоэффектов
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
        <div className="space-y-4">
          {settingsQ.isLoading ? (
            <div className="py-12 flex justify-center rounded-xl border bg-card">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-card">
                <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-sm uppercase tracking-wider">
                      {view === 'collections_photo'
                        ? 'Коллекции фотоэффектов'
                        : 'Коллекции видеоэффектов'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Создание и правка в модальном окне, затем сохранение на
                      сервер
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openNewCollectionModal()}
                  >
                    <Plus className="h-4 w-4" />
                    Добавить коллекцию
                  </Button>
                </div>
                <div className="divide-y">
                  {sortedCollectionsDraft.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center gap-4 flex-wrap"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border">
                        {item.coverUrl ? (
                          isVideoUrl(item.coverUrl) ? (
                            <video
                              src={item.coverUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              loop
                              autoPlay
                            />
                          ) : (
                            <ImageHandler
                              src={item.coverUrl}
                              alt={item.title || ''}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {item.title || 'Без названия'}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {item.description || '—'}
                        </div>
                        {!item.isActive ? (
                          <div className="text-xs text-amber-600 mt-1">
                            Неактивна
                          </div>
                        ) : null}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditCollectionModal(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCollectionById(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!sortedCollectionsDraft.length ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      Нет коллекций
                    </div>
                  ) : null}
                </div>
              </div>
              <Button
                onClick={saveCollections}
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Сохранить коллекции
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          {effectsQ.isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y">
              {effectsType ? (
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  Приоритет можно менять перетаскиванием строк
                </div>
              ) : null}
              {sortedEffects.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center gap-4"
                  draggable={!!effectsType}
                  onDragStart={() => setDraggingEffectId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async () => {
                    if (!effectsType || !draggingEffectId) return;
                    await moveEffect(draggingEffectId, item.id);
                    setDraggingEffectId(null);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {typeLabel[item.type]} •{' '}
                      {templateModelToSelectValue(item.type, item.modelParams)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Обложка 9:16 (1 файл)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTrendCover(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Квадратные изображения (до 2)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={
                    trendExistingImages.length + trendImages.length >= 2
                  }
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    const cap =
                      2 - trendExistingImages.length - trendImages.length;
                    setTrendImages(picked.slice(0, Math.max(0, cap)));
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
            {trendExistingImages.length ? (
              <div className="space-y-2">
                <Label>Текущие примеры</Label>
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  {trendExistingImages.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="relative aspect-square rounded-md overflow-hidden border bg-muted"
                    >
                      <ImageHandler
                        src={url}
                        alt="trend-example"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setTrendExistingImages((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-1 right-1 rounded-full bg-black/70 text-white text-xs px-1.5"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
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
          <EffectTemplateDialogForm
            type={effectForm.type}
            onTypeChange={(next) =>
              setEffectForm((f) => ({
                ...f,
                type: next,
                model: resolveModelForType(next, f.model),
              }))
            }
            name={effectForm.name}
            onNameChange={(v) => setEffectForm((f) => ({ ...f, name: v }))}
            description={effectForm.description}
            onDescriptionChange={(v) =>
              setEffectForm((f) => ({ ...f, description: v }))
            }
            model={effectForm.model}
            onModelChange={(v) => setEffectForm((f) => ({ ...f, model: v }))}
            costTokens={effectForm.costTokens}
            onCostTokensChange={(v) =>
              setEffectForm((f) => ({ ...f, costTokens: v }))
            }
            defaultPrompt={effectForm.defaultPrompt}
            onDefaultPromptChange={(v) =>
              setEffectForm((f) => ({ ...f, defaultPrompt: v }))
            }
            coverPreviewUrl={effectCoverPreviewUrl}
            coverStoredUrl={effectCoverUrl}
            coverAccept={
              effectForm.type === 'video_effect' ||
              effectForm.type === 'live_photo_template'
                ? 'image/*,video/*'
                : 'image/*'
            }
            onCoverFile={(f) => setEffectCoverFile(f)}
            squareUrls={effectForm.exampleImageSet}
            onRemoveSquare={(idx) =>
              setEffectForm((f) => ({
                ...f,
                exampleImageSet: f.exampleImageSet.filter((_, i) => i !== idx),
              }))
            }
            onPickSquareFiles={async (files) => {
              if (!files.length) return;
              const uploaded: string[] = [];
              for (const file of files) {
                const url = await uploadEffectCover.mutateAsync(file);
                if (url) uploaded.push(url);
              }
              if (uploaded.length) {
                setEffectForm((f) => ({
                  ...f,
                  exampleImageSet: [...f.exampleImageSet, ...uploaded].slice(
                    0,
                    2,
                  ),
                }));
                toast.success('Изображения добавлены');
              }
            }}
            isUploadingCover={false}
            isUploadingSquare={uploadEffectCover.isPending}
            isActive={effectForm.isActive}
            onIsActiveChange={(v) =>
              setEffectForm((f) => ({ ...f, isActive: v }))
            }
          />
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

      <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCollectionId
                ? 'Редактировать коллекцию'
                : 'Новая коллекция'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Название коллекции</Label>
                <Input
                  value={collectionForm.title}
                  onChange={(e) =>
                    setCollectionForm((c) => ({
                      ...c,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Название"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Порядок</Label>
                <Input
                  type="number"
                  value={collectionForm.sortOrder}
                  onChange={(e) =>
                    setCollectionForm((c) => ({
                      ...c,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Обложка</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    type="file"
                    accept={collectionCoverAccept}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) void handleUploadCollectionCoverInModal(file);
                    }}
                    className="max-w-sm"
                  />
                  {uploadEffectCover.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
                {collectionForm.coverUrl ? (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border">
                    {isVideoUrl(collectionForm.coverUrl) ? (
                      <video
                        src={collectionForm.coverUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        loop
                        autoPlay
                      />
                    ) : (
                      <ImageHandler
                        src={collectionForm.coverUrl}
                        alt={collectionForm.title || 'cover'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : null}
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Описание</Label>
                <Textarea
                  rows={2}
                  value={collectionForm.description || ''}
                  onChange={(e) =>
                    setCollectionForm((c) => ({
                      ...c,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-2 rounded-lg border bg-muted/30 p-3">
                <Label className="text-sm font-medium">
                  Где показывать коллекцию
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Неотмеченное состояние: коллекция видна во всех разделах этого
                  типа (фото или видео). Отметьте страницы, если нужно ограничить
                  показ.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {collectionDisplayTargetOptions.map((target) => {
                    const selected = (
                      collectionForm.displayTargets || []
                    ).includes(target.id);
                    return (
                      <label
                        key={target.id}
                        className="inline-flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border"
                          checked={selected}
                          onChange={(e) => {
                            const current =
                              collectionForm.displayTargets || [];
                            const next = e.target.checked
                              ? [...new Set([...current, target.id])]
                              : current.filter((t) => t !== target.id);
                            setCollectionForm((c) => ({
                              ...c,
                              displayTargets: next,
                            }));
                          }}
                        />
                        {target.label}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Список effectId</Label>
                <Textarea
                  rows={4}
                  value={(collectionForm.effectIds || []).join('\n')}
                  onChange={(e) =>
                    setCollectionForm((c) => ({
                      ...c,
                      effectIds: parseLines(e.target.value),
                    }))
                  }
                  placeholder="Каждый id с новой строки"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Пол</Label>
                  <Select
                    value={collectionForm.gender || 'both'}
                    onValueChange={(value) =>
                      setCollectionForm((c) => ({
                        ...c,
                        gender: value as 'male' | 'female' | 'both',
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
                  <Label>Топовая коллекция</Label>
                  <Select
                    value={collectionForm.isHot ? 'yes' : 'no'}
                    onValueChange={(value) =>
                      setCollectionForm((c) => ({
                        ...c,
                        isHot: value === 'yes',
                      }))
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
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Дополнительные параметры (options)
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Пара ключ–значение в JSON коллекции для будущих сценариев или
                кастомной логики. Не влияют на список эффектов по effectId, если
                клиент их явно не читает.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {collectionOptionKeys(collectionModalKind).map((key) => {
                  const ui = getCollectionOptionFieldUi(key);
                  return (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-sm">{ui.label}</Label>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {ui.hint}
                      </p>
                      <Input
                        value={collectionForm.options?.[key] || ''}
                        onChange={(e) =>
                          setCollectionForm((c) => ({
                            ...c,
                            options: {
                              ...(c.options || {}),
                              [key]: e.target.value,
                            },
                          }))
                        }
                        placeholder={ui.placeholder}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={collectionForm.isActive}
                onChange={(e) =>
                  setCollectionForm((c) => ({
                    ...c,
                    isActive: e.target.checked,
                  }))
                }
              />
              Активна
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCollectionDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={submitCollectionModal}>Сохранить в списке</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
