'use client';

import { useRef, useCallback, useState } from 'react';
import {
  useTrends,
  useCreateTrend,
  useUpdateTrend,
  useDeleteTrend,
} from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Loader2,
  Edit,
  Trash,
  Image as ImageIcon,
  X,
  Eye,
} from 'lucide-react';
import { ImageHandler } from '@/components/shared/ImageHandler';
import { getImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function ImagePreview({
  src,
  onRemove,
}: {
  src: string;
  onRemove?: () => void;
}) {
  return (
    <div className="relative group rounded-lg overflow-hidden aspect-square bg-muted">
      <ImageHandler
        src={src}
        alt="trend image"
        className="w-full h-full object-cover"
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
}

function LocalImagePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const url = URL.createObjectURL(file);
  return (
    <div className="relative group rounded-lg overflow-hidden aspect-square bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="preview" className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// View-only Dialog
// ─────────────────────────────────────────────

function ViewTrendDialog({
  trend,
  onClose,
  onEdit,
}: {
  trend: any;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Просмотр тренда</span>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1" /> Редактировать
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Cover */}
          {trend.trendingCover && (
            <div className="rounded-xl overflow-hidden max-h-64">
              <ImageHandler
                src={trend.trendingCover}
                alt="cover"
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {trend.coverText && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Текст на обложке
              </p>
              <p className="font-semibold text-lg">{trend.coverText}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Контент / Промпт
            </p>
            <p className="text-sm leading-relaxed">{trend.content}</p>
          </div>

          {/* Image set */}
          {trend.trendingImageSet?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Набор изображений ({trend.trendingImageSet.length} шт.)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {trend.trendingImageSet.map((img: string, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden aspect-square bg-muted"
                  >
                    <ImageHandler
                      src={img}
                      alt={`image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Create / Edit Dialog
// ─────────────────────────────────────────────

function TrendFormDialog({
  editingTrend,
  onClose,
}: {
  editingTrend: any | null;
  onClose: () => void;
}) {
  const createTrend = useCreateTrend();
  const updateTrend = useUpdateTrend();

  const [form, setForm] = useState({
    content: editingTrend?.content || '',
    coverText: editingTrend?.coverText || '',
    gender: editingTrend?.gender || 'both',
    isHot: editingTrend?.isHot || false,
  });

  // Cover
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  // Image set — existing (from server)
  const [existingImages, setExistingImages] = useState<string[]>(
    editingTrend?.trendingImageSet || [],
  );
  // Images to delete from server
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  // New files to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const isPending = createTrend.isPending || updateTrend.isPending;

  const currentCover =
    !removeCover && !coverFile ? editingTrend?.trendingCover : undefined;
  const coverPreview = coverFile
    ? URL.createObjectURL(coverFile)
    : currentCover
      ? getImageUrl(currentCover)
      : null;

  const handleRemoveExistingImage = (img: string) => {
    setExistingImages((prev) => prev.filter((i) => i !== img));
    setImagesToRemove((prev) => [...prev, img]);
  };

  const handleAddNewImages = (files: FileList | null) => {
    if (!files) return;
    setNewImageFiles((prev) => [
      ...prev,
      ...Array.from(files).slice(0, 10 - existingImages.length - prev.length),
    ]);
  };

  const handleRemoveNewImage = (idx: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', form.content);
    formData.append('coverText', form.coverText);
    formData.append('isHot', String(form.isHot));

    if (form.gender) {
      formData.append('gender', form.gender);
    }

    if (coverFile) {
      formData.append('trendingCover', coverFile);
    }

    newImageFiles.forEach((file) => {
      formData.append('trendingImageSet', file);
    });

    imagesToRemove.forEach((img) => {
      formData.append('removeImages', img);
    });

    if (editingTrend) {
      updateTrend.mutate(
        { id: editingTrend.id, data: formData },
        { onSuccess: onClose },
      );
    } else {
      createTrend.mutate(formData, { onSuccess: onClose });
    }
  };

  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingTrend ? 'Редактировать тренд' : 'Создать тренд'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4 my-2">
            {/* Content */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Текст (Контент / Промпт) *
              </Label>
              <Textarea
                required
                rows={3}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Опишите тренд..."
                className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Gender & Hot */}
            <div className="flex flex-col items-start justify-center w-full gap-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Пол</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, gender: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Не указано" />
                  </SelectTrigger>
                  <SelectContent defaultValue="both">
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                    <SelectItem value="both">Оба</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="checkbox"
                    checked={form.isHot}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isHot: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border border-input"
                  />
                  <span className="text-sm font-medium">Горячий тренд</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Cover text */}
          <div className="space-y-1.5 mt-4">
            <Label className="text-sm font-medium">Текст на обложке</Label>
            <Input
              type="text"
              value={form.coverText}
              onChange={(e) =>
                setForm((f) => ({ ...f, coverText: e.target.value }))
              }
              placeholder="Trending Magic..."
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Cover image */}
          <div className="my-2 space-y-2">
            <Label className="text-sm font-medium">Обложка тренда</Label>

            {coverPreview ? (
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt="cover"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    setRemoveCover(true);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <Label className="flex flex-col items-center justify-center w-full max-w-sm h-36 rounded-xl border-2 border-dashed border-input bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Нажмите для выбора
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setCoverFile(e.target.files?.[0] || null);
                    setRemoveCover(false);
                  }}
                />
              </Label>
            )}
          </div>

          {/* Image set */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Набор изображений ({totalImages}/10)
              </Label>
              {totalImages < 10 && (
                <Label className="cursor-pointer text-xs text-primary hover:underline">
                  + Добавить
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAddNewImages(e.target.files)}
                  />
                </Label>
              )}
            </div>

            {totalImages > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {/* Existing server images */}
                {existingImages.map((img, i) => (
                  <ImagePreview
                    key={`existing-${i}`}
                    src={img}
                    onRemove={() => handleRemoveExistingImage(img)}
                  />
                ))}
                {/* New local files */}
                {newImageFiles.map((file, i) => (
                  <LocalImagePreview
                    key={`new-${i}`}
                    file={file}
                    onRemove={() => handleRemoveNewImage(i)}
                  />
                ))}
                {/* Add more placeholder */}
                {totalImages < 10 && (
                  <Label className="flex items-center justify-center rounded-lg border-2 border-dashed border-input aspect-square cursor-pointer hover:bg-muted/50 transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAddNewImages(e.target.files)}
                    />
                  </Label>
                )}
              </div>
            ) : (
              <Label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-input bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <ImageIcon className="w-7 h-7 text-muted-foreground mb-1.5" />
                <span className="text-sm text-muted-foreground">
                  Добавить изображения
                </span>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAddNewImages(e.target.files)}
                />
              </Label>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTrend ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Trend Card
// ─────────────────────────────────────────────

function TrendCard({
  trend,
  onView,
  onEdit,
  onDelete,
  isDeleting,
}: {
  trend: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-200 cursor-pointer"
      onClick={onView}
    >
      {/* Cover image */}
      <div className="relative aspect-4/3 bg-muted overflow-hidden">
        {trend.trendingCover ? (
          <ImageHandler
            src={trend.trendingCover}
            alt="cover"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Cover text overlay */}
        {trend.coverText && (
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
            <p className="text-white font-semibold text-sm line-clamp-2">
              {trend.coverText}
            </p>
          </div>
        )}

        {/* Image count badge */}
        {trend.trendingImageSet?.length > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {trend.trendingImageSet.length} фото
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {trend.content}
        </p>
      </div>

      {/* Actions — appear on hover */}
      <div
        className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg bg-black/60 hover:bg-blue-500 transition-colors"
        >
          <Edit className="w-3.5 h-3.5 text-white" />
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 rounded-lg bg-black/60 hover:bg-red-500 transition-colors"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          ) : (
            <Trash className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-card border border-border">
    <div className="aspect-4/3 bg-muted animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-muted animate-pulse rounded w-full" />
      <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function TrendsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useTrends();
  const deleteTrend = useDeleteTrend();

  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    trend: any | null;
  }>({ open: false, trend: null });
  const [viewDialog, setViewDialog] = useState<any | null>(null);

  const observerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const setObserverRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(observerCallback, {
        threshold: 0.5,
      });
      observer.observe(node);
    },
    [observerCallback],
  );

  const allTrends = data?.pages.flatMap((page: any) => page.trends) ?? [];

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот тренд?')) {
      deleteTrend.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Тренды</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управление трендовыми карточками для ленты
          </p>
        </div>
        <Button onClick={() => setFormDialog({ open: true, trend: null })}>
          <Plus className="w-4 h-4 mr-2" /> Добавить тренд
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : allTrends.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Трендов пока нет</p>
        </div>
      ) : (
        <>
          <AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {allTrends.map((trend: any) => (
                <TrendCard
                  key={trend.id}
                  trend={trend}
                  onView={() => setViewDialog(trend)}
                  onEdit={() => {
                    setViewDialog(null);
                    setFormDialog({ open: true, trend });
                  }}
                  onDelete={() => handleDelete(trend.id)}
                  isDeleting={deleteTrend.isPending}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* Infinite scroll trigger */}
          <div
            ref={setObserverRef}
            className="h-16 flex items-center justify-center"
          >
            {isFetchingNextPage && (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            )}
          </div>
        </>
      )}

      {/* View Dialog */}
      {viewDialog && (
        <ViewTrendDialog
          trend={viewDialog}
          onClose={() => setViewDialog(null)}
          onEdit={() => {
            setFormDialog({ open: true, trend: viewDialog });
            setViewDialog(null);
          }}
        />
      )}

      {/* Create / Edit Dialog */}
      {formDialog.open && (
        <TrendFormDialog
          editingTrend={formDialog.trend}
          onClose={() => setFormDialog({ open: false, trend: null })}
        />
      )}
    </div>
  );
}
