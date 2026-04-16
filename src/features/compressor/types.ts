// ═══════════════════════════════════════════════════
// types — compressor feature
// Shared types for the image queue, formats and worker IO.
// ═══════════════════════════════════════════════════

export type OutputFormat = 'webp' | 'avif' | 'jpeg' | 'png';

export type ItemStatus = 'idle' | 'compressing' | 'done' | 'error';

export interface FormatDefinition {
  id: OutputFormat;
  label: string;
  extension: string;
  mime: string;
  /** Lossless formats ignore the quality slider. */
  lossless: boolean;
}

export interface CompressOptions {
  format: OutputFormat;
  /** 1–100. Ignored for lossless formats. */
  quality: number;
}

export interface CompressedOutput {
  blob: Blob;
  size: number;
  url: string;
  format: OutputFormat;
  quality: number;
  filename: string;
  width: number;
  height: number;
  ratio: number;
}

export interface ImageItem {
  id: string;
  file: File;
  originalSize: number;
  originalUrl: string;
  mimeType: string;
  status: ItemStatus;
  error?: string | undefined;
  output?: CompressedOutput | undefined;
}

export interface WorkerRequest {
  id: string;
  buffer: ArrayBuffer;
  mime: string;
  format: OutputFormat;
  quality: number;
}

export type WorkerResponse =
  | { id: string; ok: true; buffer: ArrayBuffer; width: number; height: number }
  | { id: string; ok: false; error: string };
