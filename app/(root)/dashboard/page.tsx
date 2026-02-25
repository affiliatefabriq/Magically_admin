'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAdmin';
import type { TimeRange } from '@/hooks/useAdmin';
import { MetricCard } from '@/components/shared/MetricCard';
import { AnalyticsChart } from '@/components/shared/AnalyticsChart';
import { SegmentCard } from '@/components/shared/SegmentCard';
import { TimeRangePicker } from '@/components/shared/TimeRangePicker';
import {
  Loader2,
  Users,
  ImageIcon,
  Coins,
  Activity,
  TrendingUp,
  UserX,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

const Page = () => {
  const [range, setRange] = useState<TimeRange>({ preset: 'month' });
  const { data, isLoading, isFetching } = useAnalytics(range);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const { overview, historical, segments } = data;
  const totalUsers = overview.users;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Аналитика платформы в реальном времени
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          <TimeRangePicker value={range} onChange={setRange} />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Пользователи"
          value={overview.users}
          icon={Users}
          trend={12.4}
          iconColor="text-blue-400"
        />
        <MetricCard
          title="Генерации"
          value={overview.generationsTotal}
          icon={Activity}
          sub={`${overview.generationsPending} в очереди`}
          trend={8.1}
          iconColor="text-violet-400"
        />
        <MetricCard
          title="Публикации"
          value={overview.publications}
          icon={ImageIcon}
          trend={-2.3}
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Токенов потрачено"
          value={overview.totalTokensSpent}
          icon={Coins}
          trend={15.7}
          iconColor="text-emerald-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnalyticsChart
          data={historical.generations}
          title="Генерации"
          description="Количество AI-запросов по дням"
          color="#FFC107"
          type="area"
        />
        <AnalyticsChart
          data={historical.users}
          title="Регистрации"
          description="Новые пользователи по дням"
          color="#60a5fa"
          type="area"
        />
        <AnalyticsChart
          data={historical.publications}
          title="Публикации"
          description="Новые публикации по дням"
          color="#c084fc"
          type="area"
        />
      </div>

      {/* Segments */}
      <div>
        <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
          Сегментация пользователей
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SegmentCard
            title="Активные"
            count={segments.active.length}
            total={totalUsers}
            icon={TrendingUp}
            color="text-emerald-500"
            description="Генерировали за последние 3 дня"
          />
          <SegmentCard
            title="Отвалившиеся"
            count={segments.churned.length}
            total={totalUsers}
            icon={UserX}
            color="text-red-500"
            description="Нет активности больше 7 дней"
          />
          <SegmentCard
            title="Без генераций"
            count={segments.modelNoGen.length}
            total={totalUsers}
            icon={BookOpen}
            color="text-amber-500"
            description="Создали модель, но 0 генераций"
          />
          <SegmentCard
            title="Пустые регистрации"
            count={segments.registeredOnly.length}
            total={totalUsers}
            icon={UserCheck}
            color="text-slate-400"
            description="Только зарегистрировались"
          />
        </div>
      </div>

      {/* Churned Users Table */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Требуют внимания</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Пользователи, переставшие генерировать — начислите им токены
          </p>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">Пользователь</TableHead>
                <TableHead className="text-xs">Моделей</TableHead>
                <TableHead className="text-xs">Генераций</TableHead>
                <TableHead className="text-xs text-right">
                  Последняя генерация
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.churned.slice(0, 8).map((u: any) => (
                <TableRow key={u.id} className="border-border">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{u.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.modelCount}</TableCell>
                  <TableCell className="text-sm">{u.jobCount}</TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {u.lastGenDate ? formatDate(u.lastGenDate) : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {segments.churned.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground text-sm py-8"
                  >
                    Отвалившихся пользователей нет 🎉
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;
