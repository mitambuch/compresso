import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ImageItem } from '../../types';
import { downloadAllAsZip, downloadSingle } from '../downloadZip';

const saveAsMock = vi.fn();

vi.mock('file-saver', () => ({
  saveAs: (...args: unknown[]) => saveAsMock(...args),
}));

function makeItem(name: string, withOutput = true): ImageItem {
  const file = new File(['source'], name, { type: 'image/jpeg' });
  const base: ImageItem = {
    id: name,
    file,
    originalSize: file.size,
    originalUrl: `blob:original-${name}`,
    mimeType: 'image/jpeg',
    status: withOutput ? 'done' : 'idle',
  };
  if (!withOutput) return base;

  const blob = new Blob(['out'], { type: 'image/webp' });
  return {
    ...base,
    output: {
      blob,
      size: blob.size,
      url: `blob:out-${name}`,
      format: 'webp',
      quality: 75,
      filename: name.replace(/\.[^.]+$/, '.webp'),
      width: 10,
      height: 10,
      ratio: 0.5,
    },
  };
}

beforeEach(() => {
  saveAsMock.mockReset();
});

describe('downloadSingle', () => {
  it('saves the output blob with the filename', () => {
    const item = makeItem('photo.jpg');
    downloadSingle(item);
    expect(saveAsMock).toHaveBeenCalledWith(item.output?.blob, 'photo.webp');
  });

  it('does nothing when the item has no output yet', () => {
    downloadSingle(makeItem('photo.jpg', false));
    expect(saveAsMock).not.toHaveBeenCalled();
  });
});

describe('downloadAllAsZip', () => {
  it('skips when no item has an output', async () => {
    await downloadAllAsZip([makeItem('photo.jpg', false)]);
    expect(saveAsMock).not.toHaveBeenCalled();
  });

  it('bundles ready items into a zip and saves it', async () => {
    const items = [makeItem('a.jpg'), makeItem('b.jpg')];
    await downloadAllAsZip(items, 'batch');
    expect(saveAsMock).toHaveBeenCalledTimes(1);
    const [blob, name] = saveAsMock.mock.calls[0] ?? [];
    expect(name).toBe('batch.zip');
    expect(blob).toBeInstanceOf(Blob);
  });

  it('deduplicates colliding output filenames', async () => {
    const clone = makeItem('photo.jpg');
    const dup = makeItem('photo.jpg');
    // Force same output filename to exercise the dedup branch.
    await downloadAllAsZip([clone, dup]);
    expect(saveAsMock).toHaveBeenCalledTimes(1);
  });
});
