import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CompareSlider } from '../CompareSlider';

afterEach(cleanup);

describe('CompareSlider', () => {
  it('renders with default labels', () => {
    render(<CompareSlider beforeUrl="blob:a" afterUrl="blob:b" />);
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Compressed')).toBeInTheDocument();
  });

  it('renders a slider with 0..100 range', () => {
    render(<CompareSlider beforeUrl="blob:a" afterUrl="blob:b" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('respects custom labels', () => {
    render(
      <CompareSlider beforeUrl="blob:a" afterUrl="blob:b" beforeLabel="Raw" afterLabel="WebP" />,
    );
    expect(screen.getByText('Raw')).toBeInTheDocument();
    expect(screen.getByText('WebP')).toBeInTheDocument();
  });
});
