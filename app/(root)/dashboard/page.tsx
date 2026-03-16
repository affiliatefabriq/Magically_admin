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
  CopyPlus,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

// ─── helpers ──────────────────────────────────────────────────────────────────
const truncate = (s: string, n = 60) =>
  s && s.length > n ? s.slice(0, n) + '…' : s;

// ─── Page ─────────────────────────────────────────────────────────────────────
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

  const {
    overview,
    historical,
    segments,
    failedJobs,
    topReplicatedPublications,
    topReplicatedTrends,
  } = data;
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
          sub={`${overview.generationsPending} в очереди · ${overview.generationsFailed} провалено`}
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
        <MetricCard
          title="«Хочу также» (публикации)"
          value={overview.replicatesTotal}
          icon={CopyPlus}
          iconColor="text-pink-500"
        />
        <MetricCard
          title="«Хочу также» (тренды)"
          value={overview.trendReplicatesTotal}
          icon={Flame}
          iconColor="text-orange-400"
        />
        <MetricCard
          title="Провалено генераций"
          value={overview.generationsFailed}
          icon={AlertTriangle}
          iconColor="text-red-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnalyticsChart
          data={historical.generations}
          title="Генерации"
          description="AI-запросы по дням"
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
        <AnalyticsChart
          data={historical.failedGenerations}
          title="Провальные генерации"
          description="Ошибки по дням"
          color="#f87171"
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

      {/* Tabbed detailed tables */}
      <div>
        <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
          Детальные таблицы
        </h2>
        <Tabs defaultValue="churned" className="w-full">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="churned" className="gap-1.5">
              Требуют внимания
              {segments.churned.length > 0 && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                  {segments.churned.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">
              Все пользователи
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {segments.all.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="empty" className="gap-1.5">
              Пустые
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {segments.registeredOnly.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="failed" className="gap-1.5">
              Провальные генерации
              {failedJobs?.length > 0 && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                  {failedJobs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="top-pubs" className="gap-1.5">
              Топ публикаций
            </TabsTrigger>
            <TabsTrigger value="top-trends" className="gap-1.5">
              Топ трендов
            </TabsTrigger>
          </TabsList>

          <TabsContent value="churned">
            <p className="text-xs text-muted-foreground mb-3">
              Пользователи, переставшие генерировать — начислите им токены
            </p>
            <UsersTable
              users={segments.churned.slice(0, 20)}
              showLastGen
              emptyText="Отвалившихся пользователей нет 🎉"
            />
          </TabsContent>

          <TabsContent value="all">
            <p className="text-xs text-muted-foreground mb-3">
              Полный список всех зарегистрированных пользователей
            </p>
            <UsersTable
              users={segments.all.slice(0, 50)}
              showLastGen
              showFailed
              emptyText="Пользователей пока нет"
            />
          </TabsContent>

          <TabsContent value="empty">
            <p className="text-xs text-muted-foreground mb-3">
              Зарегистрировались, но не создали ни модели, ни генерации
            </p>
            <UsersTable
              users={segments.registeredOnly.slice(0, 30)}
              emptyText="Пустых регистраций нет 🎉"
            />
          </TabsContent>

          <TabsContent value="failed">
            <p className="text-xs text-muted-foreground mb-3">
              Последние 50 провальных генераций с причиной ошибки
            </p>
            <FailedJobsTable jobs={failedJobs || []} />
          </TabsContent>

          <TabsContent value="top-pubs">
            <p className="text-xs text-muted-foreground mb-3">
              Публикации с наибольшим числом нажатий «Хочу также»
            </p>
            <TopReplicatedTable
              rows={topReplicatedPublications || []}
              type="publication"
            />
          </TabsContent>

          <TabsContent value="top-trends">
            <p className="text-xs text-muted-foreground mb-3">
              Тренды с наибольшим числом нажатий «Хочу также»
            </p>
            <TopReplicatedTable rows={topReplicatedTrends || []} type="trend" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ─── UsersTable ───────────────────────────────────────────────────────────────
const UsersTable = ({
  users,
  showLastGen,
  showFailed,
  emptyText = 'Нет данных',
}: {
  users: any[];
  showLastGen?: boolean;
  showFailed?: boolean;
  emptyText?: string;
}) => (
  <div className="rounded-xl border border-border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="text-xs">Пользователь</TableHead>
          <TableHead className="text-xs">Моделей</TableHead>
          <TableHead className="text-xs">Генераций</TableHead>
          {showFailed && <TableHead className="text-xs">Провалено</TableHead>}
          {showLastGen && (
            <TableHead className="text-xs text-right">
              Последняя генерация
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u: any) => (
          <TableRow key={u.id} className="border-border">
            <TableCell>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{u.username}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </div>
            </TableCell>
            <TableCell className="text-sm">{u.modelCount}</TableCell>
            <TableCell className="text-sm">{u.jobCount}</TableCell>
            {showFailed && (
              <TableCell className="text-sm">
                {u.failedJobCount > 0 ? (
                  <span className="text-red-500 font-medium">
                    {u.failedJobCount}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            )}
            {showLastGen && (
              <TableCell className="text-sm text-right text-muted-foreground">
                {u.lastGenDate ? formatDate(u.lastGenDate) : '—'}
              </TableCell>
            )}
          </TableRow>
        ))}
        {users.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={showFailed ? 5 : showLastGen ? 4 : 3}
              className="text-center text-muted-foreground text-sm py-8"
            >
              {emptyText}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

// ─── FailedJobsTable ──────────────────────────────────────────────────────────
const FailedJobsTable = ({ jobs }: { jobs: any[] }) => (
  <div className="rounded-xl border border-border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="text-xs">Пользователь</TableHead>
          <TableHead className="text-xs">Сервис</TableHead>
          <TableHead className="text-xs">Ошибка</TableHead>
          <TableHead className="text-xs text-right">Дата</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job: any) => (
          <TableRow key={job.id} className="border-border">
            <TableCell>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {job.user?.username ?? '—'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {job.user?.email ?? job.userId}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs capitalize">
                {job.service}
              </Badge>
            </TableCell>
            <TableCell className="max-w-70">
              <p
                className="text-xs text-red-400 truncate"
                title={job.errorMessage}
              >
                {job.errorMessage || '—'}
              </p>
            </TableCell>
            <TableCell className="text-xs text-right text-muted-foreground">
              {job.createdAt ? formatDate(job.createdAt) : '—'}
            </TableCell>
          </TableRow>
        ))}
        {jobs.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center text-muted-foreground text-sm py-8"
            >
              Провальных генераций нет 🎉
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

// ─── TopReplicatedTable ───────────────────────────────────────────────────────
const TopReplicatedTable = ({
  rows,
  type,
}: {
  rows: any[];
  type: 'publication' | 'trend';
}) => (
  <div className="rounded-xl border border-border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="text-xs">#</TableHead>
          <TableHead className="text-xs">Промпт</TableHead>
          {type === 'publication' && (
            <TableHead className="text-xs">Автор</TableHead>
          )}
          {type === 'trend' && <TableHead className="text-xs">Пол</TableHead>}
          <TableHead className="text-xs text-right">«Хочу также»</TableHead>
          {type === 'publication' && (
            <TableHead className="text-xs text-right">Лайков</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row: any, i: number) => (
          <TableRow key={row.id} className="border-border">
            <TableCell className="text-sm text-muted-foreground w-8">
              {i + 1}
            </TableCell>
            <TableCell className="max-w-65">
              <p className="text-xs truncate" title={row.content}>
                {truncate(row.content)}
              </p>
            </TableCell>
            {type === 'publication' && (
              <TableCell className="text-xs text-muted-foreground">
                {row.author?.username ?? '—'}
              </TableCell>
            )}
            {type === 'trend' && (
              <TableCell>
                {row.gender ? (
                  <Badge variant="outline" className="text-xs capitalize">
                    {row.gender}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
            )}
            <TableCell className="text-right">
              <span className="text-sm font-semibold text-pink-500">
                {row.replicateCount}
              </span>
            </TableCell>
            {type === 'publication' && (
              <TableCell className="text-xs text-right text-muted-foreground">
                {row.likeCount}
              </TableCell>
            )}
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground text-sm py-8"
            >
              Данных пока нет
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default Page;
