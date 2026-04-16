import { describe, expect, it } from 'vitest';

import { formatBytes, formatPercent } from '../formatBytes';

describe('formatBytes', () => {
  it('returns "0 B" for zero and negative values', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-5)).toBe('0 B');
  });

  it('formats values below 1 KB in bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes with one fraction digit by default', () => {
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });

  it('caps at gigabytes', () => {
    const huge = 5 * 1024 ** 3;
    expect(formatBytes(huge)).toBe('5.0 GB');
  });
});

describe('formatPercent', () => {
  it('clamps ratios into the 0..1 range', () => {
    expect(formatPercent(-0.5)).toBe('0%');
    expect(formatPercent(2)).toBe('100%');
  });

  it('rounds to the nearest percent', () => {
    expect(formatPercent(0.256)).toBe('26%');
    expect(formatPercent(0.5)).toBe('50%');
  });
});
