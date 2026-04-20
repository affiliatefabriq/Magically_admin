'use client';

import { useMemo, useState } from 'react';
import { Download, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BackupFileInfo,
  BackupType,
  useBackups,
  useDeleteBackup,
  useRunBackup,
} from '@/hooks/useAdmin';

const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const Page = () => {
  const { data, isLoading, refetch, isFetching } = useBackups();
  const runBackup = useRunBackup();
  const deleteBackup = useDeleteBackup();
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<BackupFileInfo | null>(null);

  const grouped = useMemo(() => {
    const map: Record<BackupType, BackupFileInfo[]> = {
      postgres: [],
      minio: [],
      configs: [],
    };
    for (const file of data || []) {
      map[file.type].push(file);
    }
    return map;
  }, [data]);

  const handleDownload = async (file: BackupFileInfo) => {
    setDownloadingFile(file.fileName);
    try {
      const response = await api.get(
        `/admin/backups/${file.type}/${encodeURIComponent(file.fileName)}/download`,
        { responseType: 'blob' },
      );
      const blobUrl = window.URL.createObjectURL(response.data as Blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = file.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Не удалось скачать файл');
    } finally {
      setDownloadingFile(null);
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) {
      return;
    }
    await deleteBackup.mutateAsync({
      type: fileToDelete.type,
      fileName: fileToDelete.fileName,
    });
    setFileToDelete(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Бэкапы</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Создание и выгрузка backup-файлов
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => runBackup.mutate('postgres')}
          disabled={runBackup.isPending}
        >
          {runBackup.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Создать Postgres backup
        </Button>
        <Button
          onClick={() => runBackup.mutate('minio')}
          disabled={runBackup.isPending}
        >
          {runBackup.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Создать MinIO backup
        </Button>
        <Button
          onClick={() => runBackup.mutate('configs')}
          disabled={runBackup.isPending}
        >
          {runBackup.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Создать Configs backup
        </Button>
        <Button
          variant="outline"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          Обновить список
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {(['postgres', 'minio', 'configs'] as BackupType[]).map((type) => (
            <div key={type} className="rounded-xl border border-border p-3">
              <h2 className="text-base font-semibold capitalize mb-2">
                {type}
              </h2>
              <div className="space-y-2">
                {grouped[type].length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Нет файлов для этого типа
                  </div>
                ) : (
                  grouped[type].map((file) => (
                    <div
                      key={`${file.type}-${file.fileName}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/20 p-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {file.fileName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(file.createdAt).toLocaleString()} |{' '}
                          {formatSize(file.size)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleDownload(file)}
                          disabled={downloadingFile === file.fileName}
                        >
                          {downloadingFile === file.fileName ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Download className="size-4" />
                          )}
                          Скачать
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setFileToDelete(file)}
                          disabled={deleteBackup.isPending}
                        >
                          <Trash2 className="size-4" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog
        open={Boolean(fileToDelete)}
        onOpenChange={(open) => !open && setFileToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить бэкап?</DialogTitle>
            <DialogDescription>
              Файл будет удален без возможности восстановления:
              <br />
              <span className="font-medium text-foreground">
                {fileToDelete?.fileName}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFileToDelete(null)}
              disabled={deleteBackup.isPending}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleteBackup.isPending}
            >
              {deleteBackup.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
