// ═══════════════════════════════════════════════════
// Compressor — main feature entry point
//
// WHAT: Orchestrates the ControlsPanel (one global format + quality setting),
//       the DropZone, the BatchDashboard and the compare modal. Drop any
//       number of files — they are processed in a concurrency-bounded queue
//       and downloaded as a single .zip.
// WHEN: Rendered inside `src/pages/Home.tsx`.
// ═══════════════════════════════════════════════════

import { Modal } from '@components/ui/Modal';
import { useMemo, useState } from 'react';

import { BatchDashboard } from './components/BatchDashboard';
import { CompareSlider } from './components/CompareSlider';
import { ControlsPanel } from './components/ControlsPanel';
import { DropZone } from './components/DropZone';
import { useCompressor } from './hooks/useCompressor';
import { formatBytes, formatPercent } from './lib/formatBytes';

export const Compressor = () => {
  const compressor = useCompressor();
  const [compareId, setCompareId] = useState<string | null>(null);

  const compareItem = useMemo(
    () => compressor.items.find(item => item.id === compareId) ?? null,
    [compareId, compressor.items],
  );

  const hasItems = compressor.items.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-20 sm:px-6">
      <ControlsPanel
        options={compressor.options}
        onFormatChange={compressor.setFormat}
        onQualityChange={compressor.setQuality}
      />

      <DropZone onFiles={compressor.addFiles} compact={hasItems} />

      {hasItems && (
        <BatchDashboard
          items={compressor.items}
          totals={compressor.totals}
          onClear={compressor.clearAll}
          onOpen={setCompareId}
          onRemove={compressor.removeItem}
        />
      )}

      <Modal
        isOpen={Boolean(compareItem?.output)}
        onClose={() => setCompareId(null)}
        title={compareItem?.file.name ?? 'Before / After'}
        className="max-w-4xl"
      >
        {compareItem?.output && (
          <div className="flex flex-col gap-4">
            <CompareSlider beforeUrl={compareItem.originalUrl} afterUrl={compareItem.output.url} />
            <div className="text-muted grid grid-cols-3 gap-3 font-mono text-xs sm:text-sm">
              <div>
                <p className="text-muted text-[10px] tracking-wider uppercase">Original</p>
                <p className="text-fg tabular-nums">{formatBytes(compareItem.originalSize)}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] tracking-wider uppercase">Compressed</p>
                <p className="text-fg tabular-nums">{formatBytes(compareItem.output.size)}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] tracking-wider uppercase">Saved</p>
                <p className="text-success-text tabular-nums">
                  {formatPercent(1 - compareItem.output.ratio)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
