import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  sub?: string;
  trend?: number;
  iconColor?: string;
}

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  sub,
  trend,
  iconColor,
}: MetricCardProps) => {
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className={cn('p-2 rounded-lg bg-muted', iconColor ? '' : '')}>
          <Icon
            className={cn('h-4 w-4', iconColor ?? 'text-muted-foreground')}
          />
        </div>
      </div>

      <div>
        <div className="text-3xl font-bold tracking-tight">
          {formatNumber(value)}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {trend !== undefined && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                trendPositive ? 'text-emerald-500' : 'text-red-500',
              )}
            >
              {trendPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      </div>
    </div>
  );
};
