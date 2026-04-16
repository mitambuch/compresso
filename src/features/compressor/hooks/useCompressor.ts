// ═══════════════════════════════════════════════════
// useCompressor — state + orchestration for the batch image compressor.
//
// Holds the queue of images, the current format/quality options, and
// dispatches compression jobs to the Web Worker. Re-compresses affected
// items whenever options change.
// ═══════════════════════════════════════════════════

import { useCallback, useEffect, useReducer, useRef } from 'react';

import { DEFAULT_QUALITY, getFormat, replaceExtension } from '../lib/formats';
import type {
  CompressedOutput,
  CompressOptions,
  ImageItem,
  ItemStatus,
  OutputFormat,
} from '../types';
import { compressInWorker } from '../worker/client';

interface State {
  items: ImageItem[];
  options: CompressOptions;
}

type Action =
  | { type: 'add'; items: ImageItem[] }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'setFormat'; format: OutputFormat }
  | { type: 'setQuality'; quality: number }
  | { type: 'setStatus'; id: string; status: ItemStatus; error?: string }
  | { type: 'setOutput'; id: string; output: CompressedOutput };

const INITIAL_FORMAT: OutputFormat = 'webp';

const initialState: State = {
  items: [],
  options: { format: INITIAL_FORMAT, quality: DEFAULT_QUALITY[INITIAL_FORMAT] },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return { ...state, items: [...state.items, ...action.items] };

    case 'remove': {
      const next = state.items.filter(item => item.id !== action.id);
      const removed = state.items.find(item => item.id === action.id);
      if (removed) revokeItemUrls(removed);
      return { ...state, items: next };
    }

    case 'clear':
      state.items.forEach(revokeItemUrls);
      return { ...state, items: [] };

    case 'setFormat':
      return {
        ...state,
        options: { format: action.format, quality: DEFAULT_QUALITY[action.format] },
      };

    case 'setQuality':
      return { ...state, options: { ...state.options, quality: action.quality } };

    case 'setStatus':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.id ? { ...item, status: action.status, error: action.error } : item,
        ),
      };

    case 'setOutput':
      return {
        ...state,
        items: state.items.map(item => {
          if (item.id !== action.id) return item;
          if (item.output) URL.revokeObjectURL(item.output.url);
          return { ...item, status: 'done', output: action.output, error: undefined };
        }),
      };
  }
}

function revokeItemUrls(item: ImageItem): void {
  URL.revokeObjectURL(item.originalUrl);
  if (item.output) URL.revokeObjectURL(item.output.url);
}

export interface UseCompressorResult {
  items: ImageItem[];
  options: CompressOptions;
  addFiles: (files: FileList | File[]) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  setFormat: (format: OutputFormat) => void;
  setQuality: (quality: number) => void;
  totals: {
    count: number;
    originalBytes: number;
    compressedBytes: number;
    savedBytes: number;
    ratio: number;
    ready: number;
    pending: number;
  };
}

export function useCompressor(): UseCompressorResult {
  const [state, dispatch] = useReducer(reducer, initialState);
  const optionsRef = useRef(state.options);
  optionsRef.current = state.options;

  // Track the latest job per item so that fast option changes cancel out
  // the results from stale jobs.
  const latestJobId = useRef(new Map<string, string>());

  const compressItem = useCallback(async (item: ImageItem) => {
    const jobId = crypto.randomUUID();
    latestJobId.current.set(item.id, jobId);

    const { format, quality } = optionsRef.current;
    dispatch({ type: 'setStatus', id: item.id, status: 'compressing' });

    try {
      const buffer = await item.file.arrayBuffer();
      const result = await compressInWorker(buffer, item.mimeType, format, quality);

      if (latestJobId.current.get(item.id) !== jobId) return; // superseded

      const definition = getFormat(format);
      const blob = new Blob([result.buffer], { type: definition.mime });
      const output: CompressedOutput = {
        blob,
        size: blob.size,
        url: URL.createObjectURL(blob),
        format,
        quality,
        filename: replaceExtension(item.file.name, definition.extension),
        width: result.width,
        height: result.height,
        ratio: item.originalSize > 0 ? blob.size / item.originalSize : 1,
      };
      dispatch({ type: 'setOutput', id: item.id, output });
    } catch (err) {
      if (latestJobId.current.get(item.id) !== jobId) return;
      dispatch({
        type: 'setStatus',
        id: item.id,
        status: 'error',
        error: err instanceof Error ? err.message : 'Compression failed',
      });
    }
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (list.length === 0) return;

      const newItems: ImageItem[] = list.map(file => ({
        id: crypto.randomUUID(),
        file,
        originalSize: file.size,
        originalUrl: URL.createObjectURL(file),
        mimeType: file.type || 'image/jpeg',
        status: 'idle',
      }));

      dispatch({ type: 'add', items: newItems });
      newItems.forEach(item => {
        void compressItem(item);
      });
    },
    [compressItem],
  );

  const removeItem = useCallback((id: string) => {
    latestJobId.current.delete(id);
    dispatch({ type: 'remove', id });
  }, []);

  const clearAll = useCallback(() => {
    latestJobId.current.clear();
    dispatch({ type: 'clear' });
  }, []);

  const setFormat = useCallback((format: OutputFormat) => {
    dispatch({ type: 'setFormat', format });
  }, []);

  const setQuality = useCallback((quality: number) => {
    dispatch({ type: 'setQuality', quality });
  }, []);

  // Re-compress all items when format or quality change.
  const lastOptions = useRef(state.options);
  useEffect(() => {
    const previous = lastOptions.current;
    lastOptions.current = state.options;
    if (previous.format === state.options.format && previous.quality === state.options.quality) {
      return;
    }
    state.items.forEach(item => {
      void compressItem(item);
    });
    // WHY: intentionally omit `state.items` — option changes drive the re-run,
    // not every queue mutation (which already triggers its own compress).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.options.format, state.options.quality, compressItem]);

  // Clean up all object URLs on unmount.
  useEffect(() => {
    return () => {
      state.items.forEach(revokeItemUrls);
    };
    // Run cleanup only on unmount; `state.items` is read via closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = computeTotals(state.items);

  return {
    items: state.items,
    options: state.options,
    addFiles,
    removeItem,
    clearAll,
    setFormat,
    setQuality,
    totals,
  };
}

function computeTotals(items: ImageItem[]): UseCompressorResult['totals'] {
  let originalBytes = 0;
  let compressedBytes = 0;
  let ready = 0;
  let pending = 0;

  for (const item of items) {
    originalBytes += item.originalSize;
    if (item.output) {
      compressedBytes += item.output.size;
      ready += 1;
    } else if (item.status === 'compressing' || item.status === 'idle') {
      pending += 1;
    }
  }

  const savedBytes = originalBytes - compressedBytes;
  const ratio = originalBytes > 0 ? compressedBytes / originalBytes : 1;

  return {
    count: items.length,
    originalBytes,
    compressedBytes,
    savedBytes,
    ratio,
    ready,
    pending,
  };
}
