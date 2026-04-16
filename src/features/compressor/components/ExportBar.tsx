// ═══════════════════════════════════════════════════
// ExportBar — aggregate stats + batch actions
//
// WHAT: Shows total original / compressed / saved sizes across the queue
//       and exposes "Clear all" and "Download all (.zip)" actions.
// WHEN: Render above the queue when at least one item is present.
// ═══════════════════════════════════════════════════

import { Button } from '@components/ui/Button';
import { cn } from '@utils/cn';
import { ArrowDownToLine, Package, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { downloadAllAsZip } from '../lib/downloadZip';
import { formatBytes, formatPercent } from '../lib/formatBytes';
import type { ImageItem } from '../types';

interface ExportBarProps {
  items: ImageItem[];
  totals: {
    count: number;
    originalBytes: number;
    compressedBytes: number;
    savedBytes: number;
    ratio: number;
    ready: number;
    pending: number;
  };
  onClear: () => void;
  className?: string;
}

export const ExportBar = ({ items, totals, onClear, className }: ExportBarProps) => {
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

  return (
    <div
      className={cn(
        'bg-surface/60 border-border flex w-full flex-col gap-4 rounded-2xl border p-4 backdrop-blur md:flex-row md:items-center md:justify-between md:p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Stat label="Images" value={String(totals.count)} />
        <Stat label="Before" value={formatBytes(totals.originalBytes)} />
        <Stat label="After" value={totals.ready > 0 ? formatBytes(totals.compressedBytes) : '—'} />
        <Stat
          label="Saved"
          value={
            totals.ready > 0 ? `${savedPositive ? '−' : '+'}${formatPercent(Math.abs(saved))}` : '—'
          }
          accent={savedPositive && totals.ready > 0}
        />
        {totals.pending > 0 && (
          <span className="text-muted font-mono text-xs">{totals.pending} in progress…</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          aria-label="Clear queue"
          className="text-muted hover:text-danger-text"
        >
          <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
          Clear
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => void handleZip()}
          disabled={totals.ready === 0}
          isLoading={isZipping}
        >
          {isZipping ? (
            <>
              <Package size={14} strokeWidth={1.75} aria-hidden="true" />
              Packing
            </>
          ) : (
            <>
              <ArrowDownToLine size={14} strokeWidth={1.75} aria-hidden="true" />
              Download .zip ({totals.ready})
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-muted font-mono text-[10px] tracking-wider uppercase">{label}</span>
      <span
        className={cn('font-mono text-sm tabular-nums', accent ? 'text-success-text' : 'text-fg')}
      >
        {value}
      </span>
    </div>
  );
}
