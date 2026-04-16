// ═══════════════════════════════════════════════════
// BatchDashboard — the whole batch at a glance
//
// WHAT: Big global stats (count / before / after / saved), a progress bar
//       while items are still processing, a single prominent "Download .zip"
//       CTA, and a responsive grid of thumbnails.
// WHEN: Render when the queue has at least one item.
// ═══════════════════════════════════════════════════

import { Button } from '@components/ui/Button';
import { cn } from '@utils/cn';
import { ArrowDownToLine, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { downloadAllAsZip } from '../lib/downloadZip';
import { formatBytes, formatPercent } from '../lib/formatBytes';
import type { ImageItem } from '../types';
import { ImageThumbnail } from './ImageThumbnail';

interface BatchDashboardProps {
  items: ImageItem[];
  totals: {
    count: number;
    originalBytes: number;
    compressedBytes: number;
    savedBytes: number;
    ratio: number;
    ready: number;
    pending: number;
    progress: number;
  };
  onClear: () => void;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export const BatchDashboard = ({
  items,
  totals,
  onClear,
  onOpen,
  onRemove,
  className,
}: BatchDashboardProps) => {
  const [isZipping, setIsZipping] = useState(false);

  const handleZip = async () => {
    if (totals.ready === 0) return;
    setIsZipping(true);
    try {
      await downloadAllAsZip(items);
    } finally {
      setIsZipping(false);
    }
  };

  const saved = 1 - totals.ratio;
  const savedPositive = saved > 0;
  const isBusy = totals.pending > 0;
  const hasSomeReady = totals.ready > 0;

  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      {/* Stats strip */}
      <div className="bg-surface/60 border-border grid grid-cols-2 gap-4 rounded-2xl border p-4 backdrop-blur sm:grid-cols-4 sm:p-6">
        <BigStat label="Images" value={String(totals.count)} />
        <BigStat label="Before" value={formatBytes(totals.originalBytes)} />
        <BigStat label="After" value={hasSomeReady ? formatBytes(totals.compressedBytes) : '—'} />
        <BigStat
          label="Saved"
          value={
            hasSomeReady ? `${savedPositive ? '−' : '+'}${formatPercent(Math.abs(saved))}` : '—'
          }
          accent={savedPositive && hasSomeReady}
        />
      </div>

      {/* Progress + main CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {isBusy ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-muted font-mono text-xs tracking-wider uppercase">
                  Compressing
                </span>
                <span className="text-fg font-mono text-xs tabular-nums">
                  {totals.ready}/{totals.count}
                </span>
              </div>
              <div className="bg-border/60 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-accent h-full transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.round(totals.progress * 100)}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ) : (
            <p className="text-muted font-mono text-xs tracking-wider uppercase">
              {hasSomeReady ? 'Ready to download' : 'Nothing to compress yet'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            aria-label="Clear all images"
            className="text-muted hover:text-danger-text"
          >
            <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
            Clear
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => void handleZip()}
            disabled={!hasSomeReady}
            isLoading={isZipping}
          >
            <ArrowDownToLine size={16} strokeWidth={1.75} aria-hidden="true" />
            Download .zip
            <span className="opacity-70">({totals.ready})</span>
          </Button>
        </div>
      </div>

      {/* Thumbnails grid */}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
        {items.map(item => (
          <li key={item.id}>
            <ImageThumbnail item={item} onOpen={onOpen} onRemove={onRemove} />
          </li>
        ))}
      </ul>
    </div>
  );
};

function BigStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted font-mono text-[10px] tracking-wider uppercase">{label}</span>
      <span
        className={cn(
          'font-mono text-xl tabular-nums sm:text-2xl',
          accent ? 'text-success-text' : 'text-fg',
        )}
      >
        {value}
      </span>
    </div>
  );
}
