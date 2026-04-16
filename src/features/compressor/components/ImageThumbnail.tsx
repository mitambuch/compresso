// ═══════════════════════════════════════════════════
// ImageThumbnail — compact square card for an image in the batch grid.
//
// WHAT: Small preview with status overlay and saved-% chip. Clickable to open
//       a compare modal. No per-item actions — batch download is the path.
// WHEN: Render one per item inside the BatchDashboard grid.
// ═══════════════════════════════════════════════════

import { Spinner } from '@components/ui/Spinner';
import { cn } from '@utils/cn';
import { TriangleAlert, X } from 'lucide-react';

import { formatPercent } from '../lib/formatBytes';
import type { ImageItem } from '../types';

interface ImageThumbnailProps {
  item: ImageItem;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ImageThumbnail = ({ item, onOpen, onRemove }: ImageThumbnailProps) => {
  const output = item.output;
  const saved = output ? 1 - output.ratio : 0;
  const savedPositive = saved > 0;

  return (
    <div className="group bg-surface/60 border-border relative aspect-square overflow-hidden rounded-xl border">
      <button
        type="button"
        onClick={() => output && onOpen(item.id)}
        disabled={!output}
        aria-label={output ? `Compare ${item.file.name}` : item.file.name}
        className={cn(
          'block h-full w-full',
          'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
          output ? 'cursor-zoom-in' : 'cursor-default',
        )}
      >
        <img src={item.originalUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      </button>

      {/* Status overlays */}
      {item.status === 'idle' && (
        <div className="bg-bg/50 pointer-events-none absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
          <span className="text-muted font-mono text-[10px] tracking-wider uppercase">Queued</span>
        </div>
      )}
      {item.status === 'compressing' && (
        <div className="bg-bg/50 pointer-events-none absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
          <Spinner size="sm" aria-label="Compressing" />
        </div>
      )}
      {item.status === 'error' && (
        <div className="bg-danger/20 pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center backdrop-blur-sm">
          <TriangleAlert size={16} className="text-danger-text" aria-hidden="true" />
          <span className="text-danger-text text-[10px] leading-tight">
            {item.error ?? 'Failed'}
          </span>
        </div>
      )}

      {/* Saved chip */}
      {output && (
        <span
          className={cn(
            'pointer-events-none absolute bottom-2 left-2 rounded-full px-2 py-0.5',
            'font-mono text-[10px] font-semibold tracking-wide uppercase backdrop-blur',
            savedPositive ? 'bg-success/85 text-bg' : 'bg-warning/85 text-bg',
          )}
        >
          {savedPositive ? '−' : '+'}
          {formatPercent(Math.abs(saved))}
        </span>
      )}

      {/* Remove button — visible on hover / always on touch */}
      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          onRemove(item.id);
        }}
        aria-label={`Remove ${item.file.name}`}
        className={cn(
          'bg-bg/70 text-fg absolute top-1.5 right-1.5 rounded-full p-1 backdrop-blur',
          'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        <X size={12} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
};
