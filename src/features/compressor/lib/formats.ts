// ═══════════════════════════════════════════════════
// formats — supported output formats and quality defaults
// ═══════════════════════════════════════════════════

import type { FormatDefinition, OutputFormat } from '../types';

export const FORMATS: readonly FormatDefinition[] = [
  { id: 'webp', label: 'WebP', extension: 'webp', mime: 'image/webp', lossless: false },
  { id: 'avif', label: 'AVIF', extension: 'avif', mime: 'image/avif', lossless: false },
  { id: 'jpeg', label: 'JPEG', extension: 'jpg', mime: 'image/jpeg', lossless: false },
  { id: 'png', label: 'PNG', extension: 'png', mime: 'image/png', lossless: true },
] as const;

export const DEFAULT_QUALITY: Record<OutputFormat, number> = {
  webp: 75,
  avif: 50,
  jpeg: 80,
  png: 100,
};

export const ACCEPTED_INPUT_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function getFormat(id: OutputFormat): FormatDefinition {
  const match = FORMATS.find(f => f.id === id);
  if (!match) throw new Error(`Unknown format: ${id}`);
  return match;
}

export function replaceExtension(filename: string, ext: string): string {
  const dot = filename.lastIndexOf('.');
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return `${base}.${ext}`;
}
