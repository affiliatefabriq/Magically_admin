'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import type { TimeRange } from '@/hooks/useAdmin';

interface Props {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const PRESETS: { label: string; value: TimeRange['preset'] }[] = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
];

export const TimeRangePicker = ({ value, onChange }: Props) => {
  const [showCustom, setShowCustom] = useState(false);
  const [from, setFrom] = useState(value.from ?? '');
  const [to, setTo] = useState(value.to ?? '');

  const applyCustom = () => {
    if (from && to) {
      onChange({ from, to });
      setShowCustom(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => {
            onChange({ preset: p.value });
            setShowCustom(false);
          }}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-colors border',
            value.preset === p.value && !value.from
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80',
          )}
        >
          {p.label}
        </button>
      ))}

      <button
        onClick={() => setShowCustom((v) => !v)}
        className={cn(
          'px-3 py-1.5 rounded-md text-xs font-medium transition-colors border flex items-center gap-1.5',
          value.from
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'border-border text-muted-foreground hover:text-foreground',
        )}
      >
        <CalendarDays className="h-3.5 w-3.5" />
        {value.from ? `${value.from} — ${value.to}` : 'Период'}
      </button>

      {showCustom && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card shadow-lg">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-muted-foreground text-xs">—</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={applyCustom}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition"
          >
            Применить
          </button>
        </div>
      )}
    </div>
  );
};
