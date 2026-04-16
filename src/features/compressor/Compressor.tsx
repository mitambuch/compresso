// ═══════════════════════════════════════════════════
// Compressor — main feature entry point
//
// WHAT: Orchestrates the DropZone, Controls, Queue and the compare modal
//       into a single self-contained feature component.
// WHEN: Rendered inside the route page `src/pages/Compressor.tsx`.
// ═══════════════════════════════════════════════════

import { Modal } from '@components/ui/Modal';
import { useMemo, useState } from 'react';

import { CompareSlider } from './components/CompareSlider';
import { ControlsPanel } from './components/ControlsPanel';
import { DropZone } from './components/DropZone';
import { ExportBar } from './components/ExportBar';
import { ImageQueueItem } from './components/ImageQueueItem';
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-20 sm:px-6">
      <ControlsPanel
        options={compressor.options}
        onFormatChange={compressor.setFormat}
        onQualityChange={compressor.setQuality}
      />

      {hasItems ? (
        <>
          <ExportBar
            items={compressor.items}
            totals={compressor.totals}
            onClear={compressor.clearAll}
          />

          <DropZone onFiles={compressor.addFiles} compact />

          <ul className="flex flex-col gap-3">
            {compressor.items.map(item => (
              <li key={item.id}>
                <ImageQueueItem
                  item={item}
                  onRemove={compressor.removeItem}
                  onCompare={setCompareId}
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <DropZone onFiles={compressor.addFiles} />
      )}

      <Modal
        isOpen={Boolean(compareItem?.output)}
        onClose={() => setCompareId(null)}
        title="Before / After"
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
