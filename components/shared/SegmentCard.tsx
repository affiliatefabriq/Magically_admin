import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  count: number;
  total: number;
  icon: LucideIcon;
  color: string;
  description: string;
}

export const SegmentCard = ({
  title,
  count,
  total,
  icon: Icon,
  color,
  description,
}: Props) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={cn('p-2 rounded-lg', `${color}/10`)}>
          <Icon className={cn('h-4 w-4', color)} />
        </div>
        <span
          className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            `${color}/10 ${color}`,
          )}
        >
          {pct}%
        </span>
      </div>
      <div>
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-sm font-medium mt-0.5">{title}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      {/* progress bar */}
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            color.replace('text-', 'bg-'),
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
