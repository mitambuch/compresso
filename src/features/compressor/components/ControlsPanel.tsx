// ═══════════════════════════════════════════════════
// ControlsPanel — format picker + quality slider
//
// WHAT: Lets the user pick the target format (WebP/AVIF/JPEG/PNG) and adjust
//       the quality of the compression.
// WHEN: Render above the image queue. Quality slider is hidden for lossless
//       formats (PNG).
// ═══════════════════════════════════════════════════

import { cn } from '@utils/cn';

import { FORMATS, getFormat } from '../lib/formats';
import type { CompressOptions, OutputFormat } from '../types';

interface ControlsPanelProps {
  options: CompressOptions;
  onFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number) => void;
  className?: string;
}

export const ControlsPanel = ({
  options,
  onFormatChange,
  onQualityChange,
  className,
}: ControlsPanelProps) => {
  const active = getFormat(options.format);

  return (
    <div
      className={cn(
        'bg-surface/60 border-border flex w-full flex-col gap-4 rounded-2xl border p-4 backdrop-blur md:flex-row md:items-center md:gap-6 md:p-5',
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <span className="text-muted font-mono text-xs tracking-wider uppercase">Format</span>
        <div
          role="radiogroup"
          aria-label="Output format"
          className="border-border/70 inline-flex rounded-full border p-1"
        >
          {FORMATS.map(format => {
            const isActive = format.id === options.format;
            return (
              <button
                key={format.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onFormatChange(format.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:text-sm',
                  'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
                  isActive
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:text-fg hover:bg-accent/5',
                )}
              >
                {format.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col gap-2', active.lossless && 'opacity-40')}>
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="quality-slider"
            className="text-muted font-mono text-xs tracking-wider uppercase"
          >
            Quality
          </label>
          <span className="text-fg font-mono text-sm tabular-nums">
            {active.lossless ? 'lossless' : `${options.quality}`}
          </span>
        </div>
        <input
          id="quality-slider"
          type="range"
          min={1}
          max={100}
          value={options.quality}
          disabled={active.lossless}
          onChange={event => onQualityChange(Number(event.target.value))}
          className={cn(
            'h-2 w-full appearance-none rounded-full bg-[color-mix(in_srgb,var(--color-fg)_10%,transparent)]',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:shadow-[0_0_16px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0',
            'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
            active.lossless && 'cursor-not-allowed',
          )}
        />
      </div>
    </div>
  );
};
