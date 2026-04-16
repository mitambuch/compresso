// ═══════════════════════════════════════════════════
// CompareSlider — side-by-side before/after image comparator
//
// WHAT: Renders the "before" image full-bleed and overlays the "after" image
//       clipped by a draggable vertical handle.
// WHEN: Use to visually compare original vs. compressed output inside the
//       queue item detail view.
// ═══════════════════════════════════════════════════

import { cn } from '@utils/cn';
import { GripVertical } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const CompareSlider = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Original',
  afterLabel = 'Compressed',
  className,
}: CompareSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, raw)));
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClientX(event.clientX);
    },
    [updateFromClientX],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      updateFromClientX(event.clientX);
    },
    [updateFromClientX],
  );

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.activeElement !== containerRef.current) return;
      if (event.key === 'ArrowLeft') setPosition(prev => Math.max(0, prev - 5));
      if (event.key === 'ArrowRight') setPosition(prev => Math.min(100, prev + 5));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Drag to compare original and compressed"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        'bg-surface relative isolate w-full touch-none overflow-hidden rounded-2xl select-none',
        'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
        className,
      )}
    >
      {/* Before */}
      <img
        src={beforeUrl}
        alt=""
        className="block h-auto w-full"
        draggable={false}
        loading="lazy"
      />

      {/* After, clipped from the left edge up to `position` */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={afterUrl}
          alt=""
          className="block h-full w-full object-contain"
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* Labels */}
      <span className="bg-bg/70 text-fg pointer-events-none absolute top-3 left-3 rounded-full px-3 py-1 font-mono text-xs backdrop-blur">
        {beforeLabel}
      </span>
      <span className="bg-bg/70 text-fg pointer-events-none absolute top-3 right-3 rounded-full px-3 py-1 font-mono text-xs backdrop-blur">
        {afterLabel}
      </span>

      {/* Divider + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 w-px"
        style={{ left: `calc(${position}% - 0.5px)` }}
      >
        <div className="bg-accent h-full w-full" />
        <div className="bg-accent text-on-accent absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_0_30px_color-mix(in_srgb,var(--color-accent)_50%,transparent)]">
          <GripVertical size={18} strokeWidth={1.75} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
