'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { AdminEffectTemplateType } from '@/hooks/useAdmin';
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
import { ImageHandler } from '@/components/shared/ImageHandler';
import { getModelsForType, resolveModelForType } from '@/lib/effectTemplateModels';

const isVideoUrl = (url: string) =>
  /\.(mp4|mov|webm|mkv)(\?.*)?$/i.test(url.split('?')[0]);

const SQUARE_MAX = 2;

type EffectTemplateDialogFormProps = {
  type: AdminEffectTemplateType;
  onTypeChange: (type: AdminEffectTemplateType) => void;
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  model: string;
  onModelChange: (v: string) => void;
  costTokens: string;
  onCostTokensChange: (v: string) => void;
  defaultPrompt: string;
  onDefaultPromptChange: (v: string) => void;
  coverPreviewUrl: string;
  coverStoredUrl: string;
  coverAccept: string;
  onCoverFile: (file: File | null) => void;
  squareUrls: string[];
  onRemoveSquare: (index: number) => void;
  onPickSquareFiles: (files: File[]) => void | Promise<void>;
  isUploadingCover: boolean;
  isUploadingSquare: boolean;
  isActive: boolean;
  onIsActiveChange: (v: boolean) => void;
  footerExtra?: ReactNode;
  squareSectionTitle?: string;
};

export function EffectTemplateDialogForm({
  type,
  onTypeChange,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  model,
  onModelChange,
  costTokens,
  onCostTokensChange,
  defaultPrompt,
  onDefaultPromptChange,
  coverPreviewUrl,
  coverStoredUrl,
  coverAccept,
  onCoverFile,
  squareUrls,
  onRemoveSquare,
  onPickSquareFiles,
  isUploadingCover,
  isUploadingSquare,
  isActive,
  onIsActiveChange,
  footerExtra,
  squareSectionTitle = `Квадратные изображения (до ${SQUARE_MAX})`,
}: EffectTemplateDialogFormProps) {
  const coverDisplay = coverPreviewUrl || coverStoredUrl;
  const modelList = [...getModelsForType(type)];
  const safeModel = resolveModelForType(type, model);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Тип эффекта</Label>
        <Select
          value={type}
          onValueChange={(v) => onTypeChange(v as AdminEffectTemplateType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="photo_effect">Фотоэффект</SelectItem>
            <SelectItem value="video_effect">Видеоэффект</SelectItem>
            <SelectItem value="live_photo_template">Шаблон оживления</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Заголовок на обложке</Label>
        <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Модель генерации</Label>
        <Select value={safeModel} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modelList.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Цена (токены)</Label>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={costTokens}
          onChange={(e) => onCostTokensChange(e.target.value)}
          placeholder="Пусто — по умолчанию из настроек"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Описание</Label>
        <Textarea
          rows={2}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Контент / промпт</Label>
        <Textarea
          rows={3}
          value={defaultPrompt}
          onChange={(e) => onDefaultPromptChange(e.target.value)}
        />
      </div>

      {footerExtra}

      <div className="space-y-2">
        <Label>Обложка 9:16 (1 файл)</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="file"
            accept={coverAccept}
            onChange={(e) => {
              onCoverFile(e.target.files?.[0] || null);
              e.target.value = '';
            }}
            className="max-w-sm"
          />
          {isUploadingCover ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        {coverDisplay ? (
          <div className="w-[180px] max-w-full aspect-9/16 rounded-lg border overflow-hidden bg-muted">
            {isVideoUrl(coverDisplay) ? (
              <video
                src={coverDisplay}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <ImageHandler
                src={coverDisplay}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>{squareSectionTitle}</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="file"
            accept="image/*"
            multiple
            disabled={squareUrls.length >= SQUARE_MAX}
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = '';
              if (!files.length) return;
              const slots = SQUARE_MAX - squareUrls.length;
              const slice = files.slice(0, Math.max(0, slots));
              await onPickSquareFiles(slice);
            }}
            className="max-w-sm"
          />
          {isUploadingSquare ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        {squareUrls.length ? (
          <div className="grid grid-cols-2 gap-2 max-w-sm">
            {squareUrls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="relative aspect-square rounded-md overflow-hidden border bg-muted"
              >
                <ImageHandler
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-1 right-1 h-7 w-7 p-0"
                  onClick={() => onRemoveSquare(idx)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => onIsActiveChange(e.target.checked)}
        />
        Активен
      </label>
    </div>
  );
}
