import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ImageItem } from '../../types';
import { ExportBar } from '../ExportBar';

afterEach(cleanup);

vi.mock('../../lib/downloadZip', () => ({
  downloadAllAsZip: vi.fn(() => Promise.resolve()),
  downloadSingle: vi.fn(),
}));

function make(overrides: Partial<ImageItem> = {}): ImageItem {
  const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
  return {
    id: 'a',
    file,
    originalSize: 2048,
    originalUrl: 'blob:o',
    mimeType: 'image/jpeg',
    status: 'done',
    output: {
      blob: new Blob(['o'], { type: 'image/webp' }),
      size: 1024,
      url: 'blob:b',
      format: 'webp',
      quality: 75,
      filename: 'photo.webp',
      width: 10,
      height: 10,
      ratio: 0.5,
    },
    ...overrides,
  };
}

describe('ExportBar', () => {
  it('renders aggregate stats', () => {
    render(
      <ExportBar
        items={[make()]}
        totals={{
          count: 1,
          originalBytes: 2048,
          compressedBytes: 1024,
          savedBytes: 1024,
          ratio: 0.5,
          ready: 1,
          pending: 0,
        }}
        onClear={vi.fn()}
      />,
    );
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('disables the zip button when nothing is ready', () => {
    render(
      <ExportBar
        items={[]}
        totals={{
          count: 1,
          originalBytes: 2048,
          compressedBytes: 0,
          savedBytes: 0,
          ratio: 1,
          ready: 0,
          pending: 1,
        }}
        onClear={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /download/i })).toBeDisabled();
    expect(screen.getByText(/1 in progress/i)).toBeInTheDocument();
  });

  it('calls onClear when the clear button is clicked', async () => {
    const onClear = vi.fn();
    render(
      <ExportBar
        items={[make()]}
        totals={{
          count: 1,
          originalBytes: 2048,
          compressedBytes: 1024,
          savedBytes: 1024,
          ratio: 0.5,
          ready: 1,
          pending: 0,
        }}
        onClear={onClear}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
