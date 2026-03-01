'use client';
import { useAdminPublications, useDeletePublication } from '@/hooks/useAdmin';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Loader2, User } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { ImageHandler } from '@/components/shared/ImageHandler';

export default function PublicationsPage() {
  const { data, isLoading } = useAdminPublications();
  const deletePub = useDeletePublication();

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Модерация публикаций</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {data?.rows?.map((pub: any) => (
          <Card key={pub.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                {pub.author?.avatar ? (
                  <ImageHandler
                    src={pub.author.avatar}
                    alt="avatar"
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="text-sm font-medium">
                {pub.author?.username || 'Неизвестный'}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              {/* Если у публикации есть картинка, выводим её */}
              {pub.imageUrl && (
                <div className="w-full h-full bg-muted rounded-md mb-3 overflow-hidden">
                  <ImageHandler
                    src={pub.imageUrl}
                    alt="Publication"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-4">
                {pub.content}
              </p>
            </CardContent>
            <CardFooter className="flex-1 pt-4 border-t border-border mt-auto">
              <div className="text-xs text-muted-foreground mr-auto">
                {new Date(pub.createdAt).toLocaleDateString()}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deletePub.mutate(pub.id)}
              >
                <Trash className="w-4 h-4 mr-2" /> Удалить
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {data?.rows?.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          Публикаций пока нет
        </div>
      )}
    </div>
  );
}
