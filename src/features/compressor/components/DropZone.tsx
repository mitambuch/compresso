// ═══════════════════════════════════════════════════
// DropZone — drag-and-drop + click-to-pick image input
//
// WHAT: Large, keyboard-accessible target that accepts multiple image files
//       via drag-and-drop or a native file picker and forwards them to the
//       parent via `onFiles`.
// WHEN: Use as the primary entry point of the compressor feature.
// ═══════════════════════════════════════════════════

import { cn } from '@utils/cn';
import { Images, ImageUp } from 'lucide-react';
import type { ChangeEvent, DragEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

import { ACCEPTED_INPUT_MIME } from '../lib/formats';

interface DropZoneProps {
  onFiles: (files: FileList | File[]) => void;
  /** Compact variant for use alongside an already-populated queue. */
  compact?: boolean;
  className?: string;
}

export const DropZone = ({ onFiles, compact = false, className }: DropZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer?.files?.length) onFiles(event.dataTransfer.files);
    },
    [onFiles],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) onFiles(event.target.files);
      // Reset so the same file(s) can be re-selected immediately.
      event.target.value = '';
    },
    [onFiles],
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop images here or click to select"
      onClick={openPicker}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragOver={event => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'group relative flex w-full cursor-pointer flex-col items-center justify-center',
        'rounded-3xl border-2 border-dashed text-center transition-colors',
        'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
        compact ? 'gap-2 px-4 py-6' : 'gap-4 px-6 py-16 sm:py-24',
        isDragging
          ? 'border-accent bg-accent/10'
          : 'border-border bg-surface/40 hover:border-accent/60 hover:bg-accent/5',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          'bg-accent/10 text-accent transition-transform',
          compact ? 'h-10 w-10' : 'h-16 w-16 group-hover:scale-105',
        )}
        aria-hidden="true"
      >
        {compact ? <Images size={20} strokeWidth={1.5} /> : <ImageUp size={28} strokeWidth={1.5} />}
      </div>
      <div>
        <p className={cn('text-fg font-medium', compact ? 'text-sm' : 'text-lg')}>
          {compact ? 'Add more images' : 'Drop images here or click to select'}
        </p>
        {!compact && (
          <p className="text-muted mt-1 text-sm">JPEG, PNG, WebP and AVIF · fully client-side</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_INPUT_MIME.join(',')}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
};
