import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CompressOptions } from '../../types';
import { ControlsPanel } from '../ControlsPanel';

afterEach(cleanup);

function renderPanel(overrides: Partial<CompressOptions> = {}) {
  const options: CompressOptions = { format: 'webp', quality: 75, ...overrides };
  const onFormatChange = vi.fn();
  const onQualityChange = vi.fn();
  render(
    <ControlsPanel
      options={options}
      onFormatChange={onFormatChange}
      onQualityChange={onQualityChange}
    />,
  );
  return { onFormatChange, onQualityChange };
}

describe('ControlsPanel', () => {
  it('renders every supported format', () => {
    renderPanel();
    for (const label of ['WebP', 'AVIF', 'JPEG', 'PNG']) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument();
    }
  });

  it('marks the active format as checked', () => {
    renderPanel({ format: 'jpeg' });
    expect(screen.getByRole('radio', { name: 'JPEG' })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onFormatChange when a format is selected', async () => {
    const { onFormatChange } = renderPanel();
    await userEvent.click(screen.getByRole('radio', { name: 'AVIF' }));
    expect(onFormatChange).toHaveBeenCalledWith('avif');
  });

  it('disables the quality slider for lossless PNG and shows a "lossless" label', () => {
    renderPanel({ format: 'png', quality: 100 });
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
    expect(screen.getByText(/lossless/i)).toBeInTheDocument();
  });

  it('calls onQualityChange when the slider moves', () => {
    const { onQualityChange } = renderPanel();
    const slider = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '42' } });
    expect(onQualityChange).toHaveBeenCalledWith(42);
  });
});
