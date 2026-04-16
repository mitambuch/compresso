import { describe, expect, it } from 'vitest';

import {
  ACCEPTED_INPUT_MIME,
  DEFAULT_QUALITY,
  FORMATS,
  getFormat,
  replaceExtension,
} from '../formats';

describe('FORMATS', () => {
  it('exposes every supported format with a unique id', () => {
    const ids = FORMATS.map(f => f.id);
    expect(ids).toEqual(['webp', 'avif', 'jpeg', 'png']);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks PNG as lossless', () => {
    const png = FORMATS.find(f => f.id === 'png');
    expect(png?.lossless).toBe(true);
  });

  it('exposes a default quality per format', () => {
    for (const format of FORMATS) {
      expect(DEFAULT_QUALITY[format.id]).toBeGreaterThan(0);
      expect(DEFAULT_QUALITY[format.id]).toBeLessThanOrEqual(100);
    }
  });

  it('ACCEPTED_INPUT_MIME mirrors the decoders we support', () => {
    expect(ACCEPTED_INPUT_MIME).toContain('image/jpeg');
    expect(ACCEPTED_INPUT_MIME).toContain('image/png');
    expect(ACCEPTED_INPUT_MIME).toContain('image/webp');
    expect(ACCEPTED_INPUT_MIME).toContain('image/avif');
  });
});

describe('getFormat', () => {
  it('returns the definition for a known format', () => {
    expect(getFormat('webp').label).toBe('WebP');
  });

  it('throws on an unknown format', () => {
    // @ts-expect-error — invalid by design, runtime guard
    expect(() => getFormat('bmp')).toThrow(/unknown format/i);
  });
});

describe('replaceExtension', () => {
  it('swaps the extension when present', () => {
    expect(replaceExtension('photo.jpg', 'webp')).toBe('photo.webp');
    expect(replaceExtension('a/b/c.png', 'avif')).toBe('a/b/c.avif');
  });

  it('appends an extension when the filename has none', () => {
    expect(replaceExtension('nofile', 'jpg')).toBe('nofile.jpg');
  });
});
