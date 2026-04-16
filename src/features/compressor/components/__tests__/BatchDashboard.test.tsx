import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ImageItem } from '../../types';
import { BatchDashboard } from '../BatchDashboard';

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

describe('BatchDashboard', () => {
  it('renders big stats and a ready-to-download message', () => {
    render(
      <BatchDashboard
        items={[make()]}
        totals={{
          count: 1,
          originalBytes: 2048,
          compressedBytes: 1024,
          savedBytes: 1024,
          ratio: 0.5,
          ready: 1,
          pending: 0,
          progress: 1,
        }}
        onClear={vi.fn()}
        onOpen={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getAllByText(/50%/).length).toBeGreaterThan(0);
    expect(screen.getByText(/ready to download/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download \.zip/i })).toBeEnabled();
  });

  it('shows a progress indicator while compressing', () => {
    render(
      <BatchDashboard
        items={[make({ status: 'compressing', output: undefined })]}
        totals={{
          count: 3,
          originalBytes: 6144,
          compressedBytes: 1024,
          savedBytes: 0,
          ratio: 1,
          ready: 1,
          pending: 2,
          progress: 1 / 3,
        }}
        onClear={vi.fn()}
        onOpen={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/compressing/i)).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('disables the ZIP button when nothing is ready yet', () => {
    render(
      <BatchDashboard
        items={[]}
        totals={{
          count: 1,
          originalBytes: 2048,
          compressedBytes: 0,
          savedBytes: 0,
          ratio: 1,
          ready: 0,
          pending: 1,
          progress: 0,
        }}
        onClear={vi.fn()}
        onOpen={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /download \.zip/i })).toBeDisabled();
  });

  it('calls onClear when the clear button is pressed', async () => {
    const onClear = vi.fn();
    render(
      <BatchDashboard
        items={[make()]}
        totals={{
          count: 1,
          originalBytes: 2048,
          compressedBytes: 1024,
          savedBytes: 1024,
          ratio: 0.5,
          ready: 1,
          pending: 0,
          progress: 1,
        }}
        onClear={onClear}
        onOpen={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /clear all images/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
