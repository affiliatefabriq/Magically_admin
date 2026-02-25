'use client';
import { useTrends, useCreateTrend } from '@/hooks/useAdmin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

export default function TrendsPage() {
  const { data: trends, isLoading } = useTrends();
  const create = useCreateTrend();

  const handleCreateDummy = () => {
    create.mutate({
      content: 'Новый тренд',
      coverText: 'Awesome Trend',
      trendingCover: '/dummy.jpg',
      trendingImageSet: ['/dummy1.jpg'],
    });
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Тренды</h1>
        <Button onClick={handleCreateDummy}>
          <Plus className="w-4 h-4 mr-2" /> Добавить тренд
        </Button>
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Текст</TableHead>
              <TableHead>Cover Text</TableHead>
              <TableHead>Изображения</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trends?.map((trend: any) => (
              <TableRow key={trend.id}>
                <TableCell>{trend.content}</TableCell>
                <TableCell>{trend.coverText}</TableCell>
                <TableCell>{trend.trendingImageSet?.length || 0} шт.</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
