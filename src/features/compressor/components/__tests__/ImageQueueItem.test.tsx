import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ImageItem } from '../../types';
import { ImageQueueItem } from '../ImageQueueItem';

afterEach(cleanup);

function item(overrides: Partial<ImageItem> = {}): ImageItem {
  const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
  return {
    id: 'a',
    file,
    originalSize: 1024,
    originalUrl: 'blob:original',
    mimeType: 'image/jpeg',
    status: 'compressing',
    ...overrides,
  };
}

describe('ImageQueueItem', () => {
  it('shows the filename and a processing note while compressing', () => {
    render(<ImageQueueItem item={item()} onRemove={vi.fn()} onCompare={vi.fn()} />);
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it('shows savings when the output is available', () => {
    const blob = new Blob(['out'], { type: 'image/webp' });
    render(
      <ImageQueueItem
        item={item({
          status: 'done',
          output: {
            blob,
            size: 512,
            url: 'blob:out',
            format: 'webp',
            quality: 75,
            filename: 'photo.webp',
            width: 10,
            height: 10,
            ratio: 0.5,
          },
        })}
        onRemove={vi.fn()}
        onCompare={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /compare/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /download/i })).toBeEnabled();
  });

  it('shows an error message when compression fails', () => {
    render(
      <ImageQueueItem
        item={item({ status: 'error', error: 'Oops' })}
        onRemove={vi.fn()}
        onCompare={vi.fn()}
      />,
    );
    expect(screen.getByText('Oops')).toBeInTheDocument();
  });

  it('calls onRemove when the close button is clicked', async () => {
    const onRemove = vi.fn();
    render(<ImageQueueItem item={item()} onRemove={onRemove} onCompare={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /remove photo.jpg/i }));
    expect(onRemove).toHaveBeenCalledWith('a');
  });
});
