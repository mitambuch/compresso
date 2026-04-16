import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the worker client so the hook runs under jsdom without spawning a Worker.
vi.mock('../../worker/client', () => ({
  compressInWorker: vi.fn(),
}));

import { compressInWorker } from '../../worker/client';
import { useCompressor } from '../useCompressor';

const mockedCompress = vi.mocked(compressInWorker);

beforeEach(() => {
  mockedCompress.mockReset();
  mockedCompress.mockResolvedValue({
    buffer: new ArrayBuffer(128),
    width: 10,
    height: 10,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

function pngFile(name = 'photo.png', size = 1024) {
  return new File([new Uint8Array(size)], name, { type: 'image/png' });
}

describe('useCompressor', () => {
  it('starts empty and defaults to webp + 75', () => {
    const { result } = renderHook(() => useCompressor());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.options.format).toBe('webp');
    expect(result.current.options.quality).toBe(75);
  });

  it('adds image files and marks them done once compressed', async () => {
    const { result } = renderHook(() => useCompressor());

    act(() => {
      result.current.addFiles([pngFile()]);
    });

    await waitFor(() => {
      expect(result.current.items[0]?.status).toBe('done');
    });
    expect(result.current.items[0]?.output?.format).toBe('webp');
    expect(mockedCompress).toHaveBeenCalled();
  });

  it('ignores non-image files silently', () => {
    const { result } = renderHook(() => useCompressor());
    act(() => {
      result.current.addFiles([new File(['x'], 'notes.txt', { type: 'text/plain' })]);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('reports an error when the worker rejects', async () => {
    mockedCompress.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useCompressor());

    act(() => {
      result.current.addFiles([pngFile()]);
    });

    await waitFor(() => {
      expect(result.current.items[0]?.status).toBe('error');
    });
    expect(result.current.items[0]?.error).toBe('boom');
  });

  it('removes items and clears the queue', async () => {
    const { result } = renderHook(() => useCompressor());

    act(() => {
      result.current.addFiles([pngFile('a.png'), pngFile('b.png')]);
    });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    const first = result.current.items[0]?.id;
    if (!first) throw new Error('missing id');

    act(() => {
      result.current.removeItem(first);
    });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.clearAll();
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('swaps to the new format default quality when format changes', async () => {
    const { result } = renderHook(() => useCompressor());

    act(() => {
      result.current.addFiles([pngFile()]);
    });
    await waitFor(() => expect(result.current.items[0]?.status).toBe('done'));

    act(() => {
      result.current.setFormat('avif');
    });

    expect(result.current.options.format).toBe('avif');
    expect(result.current.options.quality).toBe(50);
    await waitFor(() => {
      expect(result.current.items[0]?.output?.format).toBe('avif');
    });
  });

  it('reflects aggregate totals after compression', async () => {
    const { result } = renderHook(() => useCompressor());

    act(() => {
      result.current.addFiles([pngFile('a.png', 2048)]);
    });
    await waitFor(() => expect(result.current.items[0]?.status).toBe('done'));

    expect(result.current.totals.count).toBe(1);
    expect(result.current.totals.originalBytes).toBe(2048);
    expect(result.current.totals.ready).toBe(1);
  });
});
