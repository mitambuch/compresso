import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ImageItem } from '../../types';
import { ImageThumbnail } from '../ImageThumbnail';

afterEach(cleanup);

function item(overrides: Partial<ImageItem> = {}): ImageItem {
  const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
  return {
    id: 'a',
    file,
    originalSize: 1024,
    originalUrl: 'blob:o',
    mimeType: 'image/jpeg',
    status: 'compressing',
    ...overrides,
  };
}

describe('ImageThumbnail', () => {
  it('shows a queued overlay for idle items', () => {
    render(<ImageThumbnail item={item({ status: 'idle' })} onOpen={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(/queued/i)).toBeInTheDocument();
  });

  it('shows a spinner while compressing', () => {
    render(<ImageThumbnail item={item()} onOpen={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByLabelText(/compressing/i)).toBeInTheDocument();
  });

  it('shows the error message when compression failed', () => {
    render(
      <ImageThumbnail
        item={item({ status: 'error', error: 'Bad format' })}
        onOpen={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText('Bad format')).toBeInTheDocument();
  });

  it('shows the saved % chip once the output is ready and opens the compare modal', async () => {
    const onOpen = vi.fn();
    const blob = new Blob(['o'], { type: 'image/webp' });
    render(
      <ImageThumbnail
        item={item({
          status: 'done',
          output: {
            blob,
            size: 512,
            url: 'blob:b',
            format: 'webp',
            quality: 75,
            filename: 'photo.webp',
            width: 10,
            height: 10,
            ratio: 0.5,
          },
        })}
        onOpen={onOpen}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/50%/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /compare photo.jpg/i }));
    expect(onOpen).toHaveBeenCalledWith('a');
  });

  it('calls onRemove without opening the modal', async () => {
    const onOpen = vi.fn();
    const onRemove = vi.fn();
    render(<ImageThumbnail item={item()} onOpen={onOpen} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: /remove photo.jpg/i }));
    expect(onRemove).toHaveBeenCalledWith('a');
    expect(onOpen).not.toHaveBeenCalled();
  });
});
