// ═══════════════════════════════════════════════════
// ImageQueueItem — row inside the batch queue
//
// WHAT: Displays a single image with its original / compressed stats,
//       progress state, a compare button (opens a modal) and a download button.
// WHEN: Render one per item in the compressor queue.
// ═══════════════════════════════════════════════════

import { Spinner } from '@components/ui/Spinner';
import { cn } from '@utils/cn';
import { ArrowDownToLine, Eye, TriangleAlert, X } from 'lucide-react';

import { downloadSingle } from '../lib/downloadZip';
import { formatBytes, formatPercent } from '../lib/formatBytes';
import type { ImageItem } from '../types';

interface ImageQueueItemProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  onCompare: (id: string) => void;
}

export const ImageQueueItem = ({ item, onRemove, onCompare }: ImageQueueItemProps) => {
  const output = item.output;
  const saved = output ? 1 - output.ratio : 0;
  const savedPositive = saved > 0;

  return (
    <div className="border-border bg-surface/60 group relative flex gap-3 overflow-hidden rounded-2xl border p-3 backdrop-blur">
      <div className="bg-bg relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
        <img src={item.originalUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        {item.status === 'compressing' && (
          <div className="bg-bg/60 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <Spinner size="sm" aria-label="Compressing" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="min-w-0">
          <p className="text-fg truncate text-sm font-medium">{item.file.name}</p>
          <div className="text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
            <span>{formatBytes(item.originalSize)}</span>
            <span aria-hidden="true">→</span>
            {output ? (
              <>
                <span className="text-fg">{formatBytes(output.size)}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                    savedPositive
                      ? 'bg-success/15 text-success-text'
                      : 'bg-warning/15 text-warning-text',
                  )}
                >
                  {savedPositive ? '−' : '+'}
                  {formatPercent(Math.abs(saved))}
                </span>
              </>
            ) : item.status === 'error' ? (
              <span className="text-danger-text flex items-center gap-1">
                <TriangleAlert size={12} aria-hidden="true" />
                {item.error ?? 'Failed'}
              </span>
            ) : (
              <span>processing…</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onCompare(item.id)}
            disabled={!output}
            className={cn(
              'border-border hover:border-accent/40 hover:bg-accent/5 text-fg inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
              'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
              'disabled:hover:border-border disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
            )}
          >
            <Eye size={12} strokeWidth={1.75} aria-hidden="true" />
            Compare
          </button>
          <button
            type="button"
            onClick={() => downloadSingle(item)}
            disabled={!output}
            className={cn(
              'bg-accent/10 text-accent-text hover:bg-accent/20 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors',
              'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
              'disabled:hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            <ArrowDownToLine size={12} strokeWidth={1.75} aria-hidden="true" />
            Download
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Remove ${item.file.name}`}
        onClick={() => onRemove(item.id)}
        className="text-muted hover:text-fg hover:bg-accent/5 focus-visible:ring-accent absolute top-2 right-2 rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <X size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
};
