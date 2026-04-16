/// <reference lib="WebWorker" />

// ═══════════════════════════════════════════════════
// compressor.worker — @jsquash decode + encode off the main thread
//
// WHAT: Receives an ArrayBuffer + target format/quality, decodes the source
//       image, re-encodes it to the target format, and posts the resulting
//       ArrayBuffer back (transferable, zero-copy).
// WHEN: Used by the compressor feature. Never imported from the main thread
//       directly — always via `new Worker(new URL('./compressor.worker.ts', ...))`.
// ═══════════════════════════════════════════════════

import decodeAvif from '@jsquash/avif/decode';
import encodeAvif from '@jsquash/avif/encode';
import decodeJpeg from '@jsquash/jpeg/decode';
import encodeJpeg from '@jsquash/jpeg/encode';
import decodePng from '@jsquash/png/decode';
import encodePng from '@jsquash/png/encode';
import decodeWebp from '@jsquash/webp/decode';
import encodeWebp from '@jsquash/webp/encode';

import type { OutputFormat, WorkerRequest, WorkerResponse } from '../types';

// eslint-disable-next-line no-undef -- DedicatedWorkerGlobalScope lives in the WebWorker lib referenced above
declare const self: DedicatedWorkerGlobalScope;

async function decode(mime: string, buffer: ArrayBuffer): Promise<ImageData> {
  const lower = mime.toLowerCase();
  let imageData: ImageData | null = null;

  if (lower.includes('jpeg') || lower.includes('jpg')) imageData = await decodeJpeg(buffer);
  else if (lower.includes('png')) imageData = await decodePng(buffer);
  else if (lower.includes('webp')) imageData = await decodeWebp(buffer);
  else if (lower.includes('avif')) imageData = await decodeAvif(buffer);
  else throw new Error(`Unsupported input format: ${mime || 'unknown'}`);

  if (!imageData) throw new Error(`Failed to decode image (${mime})`);
  return imageData;
}

async function encode(
  format: OutputFormat,
  quality: number,
  imageData: ImageData,
): Promise<ArrayBuffer> {
  switch (format) {
    case 'jpeg':
      return encodeJpeg(imageData, { quality });
    case 'webp':
      return encodeWebp(imageData, { quality });
    case 'avif':
      // AVIF quality in @jsquash maps 0–100 (higher = better); cq in libavif is inverted.
      return encodeAvif(imageData, { quality });
    case 'png':
      // PNG is lossless — quality is ignored. oxipng level stays at default.
      return encodePng(imageData);
  }
}

async function handle(request: WorkerRequest): Promise<void> {
  const { id, buffer, mime, format, quality } = request;
  try {
    const imageData = await decode(mime, buffer);
    const output = await encode(format, quality, imageData);

    const response: WorkerResponse = {
      id,
      ok: true,
      buffer: output,
      width: imageData.width,
      height: imageData.height,
    };
    self.postMessage(response, [output]);
  } catch (err) {
    const response: WorkerResponse = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
}

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  void handle(event.data);
});
