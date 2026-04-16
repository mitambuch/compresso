import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DropZone } from '../DropZone';

afterEach(cleanup);

describe('DropZone', () => {
  it('renders the default drop-area copy', () => {
    render(<DropZone onFiles={vi.fn()} />);
    expect(screen.getByText(/drop images here/i)).toBeInTheDocument();
  });

  it('renders compact copy when compact is true', () => {
    render(<DropZone onFiles={vi.fn()} compact />);
    expect(screen.getByText(/add more images/i)).toBeInTheDocument();
  });

  it('opens the file picker when activated with Enter', async () => {
    render(<DropZone onFiles={vi.fn()} />);
    const button = screen.getByRole('button', { name: /drop images/i });
    const input = button.parentElement?.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(input as HTMLElement, 'click');
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('forwards dropped files to onFiles', () => {
    const onFiles = vi.fn();
    render(<DropZone onFiles={onFiles} />);
    const zone = screen.getByRole('button', { name: /drop images/i });

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(onFiles).toHaveBeenCalled();
  });
});
